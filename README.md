# blindsig-client-server-example
Example of usage of https://github.com/arnaucube/go-blindsecp256k1, including a server representing the 'signer', and a web representing the 'user'.

## Run
- Needs [go](https://golang.org/) installed
- Add the file `wasm_exec.js` in the `client` directory:
```
cd client
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
```
- Run the server:
```
go run main.go
```
- Open the browser at `127.0.0.1:3000/web`

## Flow
![diagram](https://raw.githubusercontent.com/arnaucube/blindsig-client-server-example/master/diagram.png "diagram")
