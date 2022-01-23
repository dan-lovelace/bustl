package lib

import (
	"encoding/json"
	"errors"
	"fmt"

	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox"
	"project-oakwood/services/toolbox/uploads"
)

type imageSourceCacheValue struct {
	Source    string `json:"source"`
	Thumbnail string `json:"thumbnail"`
}

func GetImageSource(username string, filename string, processingState string) (imageSourceCacheValue, error) {
	// use username/filename as cache key
	key := fmt.Sprintf("%s/%s", username, filename)

	// check cache
	cache, err := toolbox.GetCacheItem(key)
	if err != nil {
		return imageSourceCacheValue{}, err
	}

	if cache != nil {
		// cache hit
		cacheJson, err := json.Marshal(cache)
		if err != nil {
			return imageSourceCacheValue{}, err
		}

		var cachedItem toolbox.CacheItem
		err = json.Unmarshal(cacheJson, &cachedItem)
		if err != nil {
			return imageSourceCacheValue{}, err
		}

		var cachedImageSource imageSourceCacheValue
		err = json.Unmarshal(cachedItem.Value, &cachedImageSource)
		if err != nil {
			return imageSourceCacheValue{}, err
		}

		return cachedImageSource, nil
	}

	// cache miss, create new signed url with an expiration longer than cache setting
	cacheMinutes := int32(toolbox.ImageCacheLength)
	presignExpiration := cacheMinutes + 5

	// get source url, ignore processing state since this one always exists
	sourcePrepend := types.LabelConfig["large"]
	sourceKey := uploads.GetUserUploadPostProcessingKey(username, sourcePrepend, filename)
	sourceUrl, err := toolbox.GetS3ObjectRequest(uploads.UploadsBucket, sourceKey, presignExpiration)
	if err != nil {
		return imageSourceCacheValue{}, err
	}

	// get thumbnail key using processing state
	var thumbnailKey string
	thumbnailPrepend := types.LabelConfig["small"]
	if processingState == types.PostProcessingState {
		// thumbnail has been processed
		thumbnailKey = uploads.GetUserUploadPostProcessingKey(username, thumbnailPrepend, filename)
	} else {
		// thumbnail not processed, use source key
		thumbnailKey = sourceKey
	}

	thumbnailUrl, err := toolbox.GetS3ObjectRequest(uploads.UploadsBucket, thumbnailKey, presignExpiration)
	if err != nil {
		return imageSourceCacheValue{}, err
	}

	newValue := imageSourceCacheValue{
		Source:    sourceUrl,
		Thumbnail: thumbnailUrl,
	}

	newValueJson, err := json.Marshal(newValue)
	if err != nil {
		return imageSourceCacheValue{}, err
	}

	// update cache
	err = toolbox.SetCacheItem(toolbox.CacheItem{
		Key:        key,
		Value:      []byte(newValueJson),
		Expiration: cacheMinutes * 60, // seconds
	})
	if err != nil {
		return imageSourceCacheValue{}, err
	}

	return newValue, nil
}

func ParseMimeType(mime string) (string, error) {
	valid := false

	for k := range uploads.ValidMimes {
		if uploads.ValidMimes[k] != "" {
			valid = true
			break
		}
	}

	if valid != true {
		return "", errors.New("Invalid mime type")
	}

	return uploads.ValidMimes[mime], nil
}
