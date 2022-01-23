package subscription

import (
	"os"

	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/customer"

	"project-oakwood/services/toolbox"
)

func setupClient() error {
	if stripe.Key == "" {
		// get from secrets manager
		secretId := os.Getenv("STRIPE_PRIVATE_KEY_SECRET_ID")
		secret, err := toolbox.GetSecret(secretId)
		if err != nil {
			return err
		}

		stripe.Key = secret
	}

	return nil
}

func GetCustomer(id string) (*stripe.Customer, error) {
	err := setupClient()
	if err != nil {
		return nil, err
	}

	return customer.Get(id, nil)
}

func CreateCustomer(input stripe.CustomerParams) (*stripe.Customer, error) {
	err := setupClient()
	if err != nil {
		return nil, err
	}

	return customer.New(&input)
}
