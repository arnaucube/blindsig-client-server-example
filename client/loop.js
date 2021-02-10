// This version uses https://github.com/arnaucube/blindsecp256k1-js

// const blindsecp256k1 = require('blindsecp256k1');
// const axios = require('axios');

let signerR, signerQ, m, mBlinded, userSecretData, blindedSig, sig, errCount, verified;

const apiUrl = "http://127.0.0.1:3000";

function printPoint(name, p) {
	console.log(`${name}:\n	x: ${p.affineX.toString()}\n	y: ${p.affineY.toString()}`);
}

async function newRequest() {
	try {
		const res = await axios.get(apiUrl+'/request');
		signerR = blindsecp256k1.Point.fromAffine(blindsecp256k1.ecparams,
			blindsecp256k1.newBigFromString(res.data.signerR.x),
			blindsecp256k1.newBigFromString(res.data.signerR.y));
		signerQ = blindsecp256k1.Point.fromAffine(blindsecp256k1.ecparams,
			blindsecp256k1.newBigFromString(res.data.signerQ.x),
			blindsecp256k1.newBigFromString(res.data.signerQ.y));

		let blindRes = blindsecp256k1.blind(m, signerR);
		mBlinded = blindRes.mBlinded;
		userSecretData = blindRes.userSecretData;
	} catch (error) {
		console.error(error);
	}
}

async function askBlindSign() {
	try {
		let data = {
			m: mBlinded.toString(),
			r: {
				x: signerR.affineX.toString(),
				y: signerR.affineY.toString()
			}
		};
		let res = await axios.post(apiUrl+'/blindsign', data);
		blindedSig = blindsecp256k1.newBigFromString(res.data.sBlind);
		sig = blindsecp256k1.unblind(
			blindedSig,
			userSecretData);
	} catch (error) {
		console.error(error);
	}
}

async function verify() {
	verified = blindsecp256k1.verify(m, sig, signerQ);
	if (!verified) {
		errCount++;
		printPoint("signerR", signerR);
		printPoint("signerQ", signerQ);
		console.log("m:", m.toString());
		console.log("mBlinded:", mBlinded.toString());
		console.log(`userSecretData:\n	a: ${userSecretData.a.toString()}\n	b: ${userSecretData.b.toString()}`);
		printPoint("userSecretData.f", userSecretData.f);
		console.log("blinded sig:", blindedSig.toString());
		console.log("sig.s:", sig.s.toString());
		printPoint("sig.f", sig.f);
		console.log("verify", verified);
		alert("ERROR")
	}
}

async function iteration() {
	await newRequest()
	await askBlindSign()
	await verify()
}

async function start() {
	errCount = 0;
	for (let i=0; i<10000; i++) {
		m = blindsecp256k1.newKeyPair().sk;

		await iteration()
		if (i%100 ==0) {
			console.log("number of iterations", i);
		}
	}
	console.log("errCount", errCount);
}

