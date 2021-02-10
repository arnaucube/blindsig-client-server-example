// signer public parameters
let rx, ry, qx, qy;
// user parameters
let m, mBlinded, uA, uB, uFx, uFy, sigS, sigFx, sigFy;

function newRequest() {
	m = document.getElementById("msg").value;

	axios.get('/request')
		.then(function (res) {
			console.log("/request res:", res.data);
			rx = res.data.signerR.x;
			ry = res.data.signerR.y;
			qx = res.data.signerQ.x;
			qy = res.data.signerQ.y;
			document.getElementById("signerRx").innerHTML = "signerR.x: " + rx;
			document.getElementById("signerRy").innerHTML = "signerR.y: " + ry;

			document.getElementById("signerQx").innerHTML = "signerQ.x: " + qx;
			document.getElementById("signerQy").innerHTML = "signerQ.y: " + qy;

			console.log("blind msg");
			let blindRes = wasmBlind(m, rx, ry);
			console.log("blindRes:", blindRes);
			mBlinded = blindRes.mBlinded;
			uA = blindRes.uA;
			uB = blindRes.uB;
			uFx = blindRes.uFx;
			uFy = blindRes.uFy;
		})
		.catch(function (error) {
			console.error(error);
			alert(error);
		});
}

function askBlindSign() {
	console.log("askBlindSign");
	let data = {
		m: mBlinded,
		r: {x:rx, y:ry}
	};
	axios.post('/blindsign', data)
		.then(function (res) {
			console.log("/blindSign res:", res.data);
			document.getElementById("sBlind").innerHTML = "sBlind: " + res.data.sBlind;

			let unblindRes = wasmUnblind(res.data.sBlind, m, uA, uB, uFx, uFy);
			console.log("unblind", unblindRes);
			sigS = unblindRes.s;
			sigFx = unblindRes.fx;
			sigFy = unblindRes.fy;
			document.getElementById("sigS").innerHTML = "s: " + sigS;
			document.getElementById("sigFx").innerHTML = "f.x: " + sigFx;
			document.getElementById("sigFy").innerHTML = "f.y: " + sigFy;
		})
		.catch(function (error) {
			console.error(error);
			alert(error);
		});
}

function verify() {
	let verified = wasmVerify(m, sigS, sigFx, sigFy, qx, qy);
	console.log("verify", verified);
	document.getElementById("verified").innerHTML = "signature verification, verified: " + verified;
}

