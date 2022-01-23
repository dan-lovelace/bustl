package toolbox

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"project-oakwood/services/api/types"
)

// GetAppConfig attempts to fetch the file `app-config.json` from the About client.
// It will return an error if something goes wrong while fetching or if the file
// cannot be found.
func GetAppConfig() (*types.AppConfig, error) {
	httpClient := http.Client{
		Timeout: 3 * time.Second,
	}
	aboutClientDomain := os.Getenv("ABOUT_CLIENT_DOMAIN_NAME")
	appConfigLocation := fmt.Sprintf("https://%s/app-config.json", aboutClientDomain)
	appConfigRes, err := httpClient.Get(appConfigLocation)
	if err != nil {
		return nil, err
	}
	defer appConfigRes.Body.Close()

	if appConfigRes.StatusCode == 200 {
		body, err := ioutil.ReadAll(appConfigRes.Body)
		if err != nil {
			return nil, err
		}

		var appConfig types.AppConfig
		json.Unmarshal(body, &appConfig)

		return &appConfig, nil
	}

	return nil, fmt.Errorf("Could not find app config at %s", appConfigLocation)
}
