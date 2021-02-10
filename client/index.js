// This version uses https://github.com/arnaucube/blindsecp256k1-js

// signer public parameters
let signerR, signerQ;
// user parameters
let m, mBlinded, userSecretData, sig;

console.log("A", blindsecp256k1.messageToBigNumber("0x0a"))

function newRequest() {
	m = document.getElementById("msg").value;

	axios.get('/request')
		.then(function (res) {
			console.log("/request res:", res.data);
			signerR = blindsecp256k1.Point.fromAffine(blindsecp256k1.ecparams,
				blindsecp256k1.newBigFromString(res.data.signerR.x),
				blindsecp256k1.newBigFromString(res.data.signerR.y));
			signerQ = blindsecp256k1.Point.fromAffine(blindsecp256k1.ecparams,
				blindsecp256k1.newBigFromString(res.data.signerQ.x),
				blindsecp256k1.newBigFromString(res.data.signerQ.y));
			document.getElementById("signerR").innerHTML = "signerR: " + signerR;

			document.getElementById("signerQ").innerHTML = "signerQ: " + signerQ;

			console.log("blind msg");
			let blindRes = blindsecp256k1.blind(m, signerR);
			mBlinded = blindRes.mBlinded;
			userSecretData = blindRes.userSecretData;
			console.log("blindRes:", mBlinded, userSecretData);
		})
		.catch(function (error) {
			console.error(error);
			alert(error);
		});
}

function askBlindSign() {
	console.log("askBlindSign");
	let data = {
		m: mBlinded.toString(),
		r: {
			x: signerR.affineX.toString(),
			y: signerR.affineY.toString()
		}
	};
	axios.post('/blindsign', data)
		.then(function (res) {
			console.log("/blindSign res:", res.data);
			document.getElementById("sBlind").innerHTML = "sBlind: " + res.data.sBlind;

			sig = blindsecp256k1.unblind(
				blindsecp256k1.newBigFromString(res.data.sBlind),
				userSecretData);
			console.log("unblind", sig);
			document.getElementById("sig").innerHTML = "sig.s: " + sig.s + ", sig.f: " + sig.f.affineX.toString() +", "+sig.f.affineY.toString();
		})
		.catch(function (error) {
			console.error(error);
			alert(error);
		});
}

function verify() {
	let verified = blindsecp256k1.verify(m, sig, signerQ);
	console.log("verify", verified);
	document.getElementById("verified").innerHTML = "signature verification, verified: " + verified;
}
