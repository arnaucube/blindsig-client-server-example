package main

import (
	"math/big"
	"net/http"

	blindsecp256k1 "github.com/arnaucube/go-blindsecp256k1"
	"github.com/gin-gonic/gin"
)

var sk *blindsecp256k1.PrivateKey
var secretRs = make(map[string]*big.Int)

func getNewRequest(c *gin.Context) {
	k, signerR := blindsecp256k1.NewRequestParameters()
	key := signerR.X.String() + signerR.Y.String()
	secretRs[key] = k
	c.JSON(http.StatusOK, gin.H{"signerR": signerR, "signerQ": sk.Public().Point()})
}

type msgPostBlindSign struct {
	M string                `json:"m"`
	R *blindsecp256k1.Point `json:"r"`
}

func postBlindSign(c *gin.Context) {
	var msg msgPostBlindSign
	c.BindJSON(&msg)

	m, ok := new(big.Int).SetString(msg.M, 10)
	if !ok {
		c.String(http.StatusBadRequest, "can not parse m")
		return
	}

	key := msg.R.X.String() + msg.R.Y.String()
	if _, ok := secretRs[key]; !ok {
		c.String(http.StatusBadRequest, "unknown R")
		return
	}
	k := secretRs[key]
	sBlind, err := sk.BlindSign(m, k)
	if err != nil {
		c.String(http.StatusBadRequest, "err on BlindSign: "+err.Error())
		return
	}
	delete(secretRs, key)
	c.JSON(http.StatusOK, gin.H{"sBlind": sBlind.String()})
}

func main() {
	secretRs = make(map[string]*big.Int)
	sk = blindsecp256k1.NewPrivateKey()

	r := gin.Default()

	r.GET("/request", getNewRequest)
	r.POST("/blindsign", postBlindSign)
	r.Static("/web", "./client")

	r.Run("127.0.0.1:3000")
}
