package toolbox

import (
	"encoding/json"
	"os"

	"github.com/bradfitz/gomemcache/memcache"
)

type CacheItem struct {
	// Key specifies the string to use for the caching key
	Key string `json:"key"`

	// Value specifies the list of bytes to use for the cached value
	Value []byte `json:"value"`

	// Expiration specifies the length in seconds the item should be cached
	Expiration int32 `json:"expiration"`
}

// cache `client` in the lambda execution context
var client *memcache.Client

// ImageCacheLength describes how long to cache presigned image URLs in minutes
var ImageCacheLength = 60

func getClient() (*memcache.Client, error) {
	// see if client is cached
	if client == nil {
		// initialize new client and update cache
		endpoint := os.Getenv("CACHE_ENDPOINT")
		client = memcache.New(endpoint)
	}

	// return cached value
	return client, nil
}

func FlushAll() error {
	// get cache client
	mc, err := getClient()
	if err != nil {
		return err
	}

	// flush all keys
	err = mc.FlushAll()
	if err != nil {
		return err
	}

	// return success
	return nil
}

func GetCacheItem(key string) (*CacheItem, error) {
	// get cache client
	mc, err := getClient()
	if err != nil {
		return nil, err
	}

	// query cache
	item, err := mc.Get(key)

	// check for cache miss error before any other errors
	if err == memcache.ErrCacheMiss {
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	// cache hit, convert item to json
	itemJson, err := json.Marshal(item)
	if err != nil {
		return nil, err
	}

	// unmarshal and return
	var cItem CacheItem
	err = json.Unmarshal(itemJson, &cItem)
	if err != nil {
		return nil, err
	}

	return &cItem, nil
}

func SetCacheItem(newItem CacheItem) error {
	// get cache client
	mc, err := getClient()
	if err != nil {
		return err
	}

	// set up new item for insertion
	setItem := memcache.Item{
		Key:        newItem.Key,
		Value:      newItem.Value,
		Expiration: newItem.Expiration,
	}

	// insert new item
	err = mc.Set(&setItem)
	if err != nil {
		return err
	}

	return nil
}
