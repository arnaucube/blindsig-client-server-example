# Loop test
- Run the server from the repo root directory: `go run main.go`
- Install npm dependancies `npm install`
- Run the nodejs loop script: `node loop-test.js`
	- This will print on the screen the number of iterations each 100 iterations
	- And if there is an error verifying a signature, will print all the involved parameters
		- signature verification is done on the JS side, but also sent to the server to verify it from the Go side


