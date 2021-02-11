package main

import (
	"fmt"
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

type msgPostVerify struct {
	M   string                    `json:"m"`
	Sig *blindsecp256k1.Signature `json:"sig"`
	Q   *blindsecp256k1.PublicKey `json:"q"`
}

func postVerify(c *gin.Context) {
	var msg msgPostVerify
	c.BindJSON(&msg)

	m, ok := new(big.Int).SetString(msg.M, 10)
	if !ok {
		c.String(http.StatusBadRequest, "can not parse m")
		return
	}
	fmt.Println(msg.Sig.S, msg.Sig.F)
	v := blindsecp256k1.Verify(m, msg.Sig, sk.Public())
	fmt.Println("v", v)
	if !v {
		fmt.Println("m", m)
		fmt.Println("sig.s", msg.Sig.S)
		fmt.Println("sig.f", msg.Sig.F)
		fmt.Println("pubk", sk.Public())
		fmt.Println("q", msg.Q)
		c.JSON(http.StatusNotAcceptable, gin.H{"verification": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"verification": v})
}

func main() {
	secretRs = make(map[string]*big.Int)
	sk = blindsecp256k1.NewPrivateKey()

	r := gin.Default()

	r.GET("/request", getNewRequest)
	r.POST("/blindsign", postBlindSign)
	r.POST("/verify", postVerify)
	r.Static("/web", "./client")

	r.Run("127.0.0.1:3000")
}
