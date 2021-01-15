
var newPass1Reg = new RegExp("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,72}$")
var oldPassReg = new RegExp("\\S")
var oldPassMessage = "Old password field cannot be empty"
var newPassMessage = "New password must consist of 8-72 characters, including a letter, a number and a special character"
var newPass2Message = "Passwords must match"
var passForm = null

var fieldState = {
    "oldPass": false,
    "newPass1": false,
    "newPass2": false
}

window.onload = function () {
    passForm = document.getElementById("password-change")
    passForm.addEventListener("submit", onSubmitData)

    document.getElementById("old-pass").addEventListener("change", validateOldPass)
    document.getElementById("new-pass1").addEventListener("change", validateNewPass1)
    document.getElementById("new-pass2").addEventListener("change", validateNewPass2)
}

validateOldPass = function () {
    let password = document.getElementById("old-pass").value
    let errorMsg = document.getElementById("old-pass-error")

    if (oldPassReg.test(password)) {
        fieldState["oldPass"] = true
        errorMsg.className = "error-mes-hidden"
        errorMsg.innerText = ""
    } else {
        fieldState["oldPass"] = false
        errorMsg.className = "error-mes"
        errorMsg.innerText = oldPassMessage
    }
}

validateNewPass1 = function () {
    let password = document.getElementById("new-pass1").value
    let errorMsg = document.getElementById("new-pass1-error")

    if (newPass1Reg.test(password)) {
        fieldState["newPass1"] = true
        errorMsg.className = "error-mes-hidden"
        errorMsg.innerText = ""
    } else {
        fieldState["newPass1"] = false
        errorMsg.className = "error-mes"
        errorMsg.innerText = newPassMessage
    }
}

validateNewPass2 = function () {
    let password = document.getElementById("new-pass1").value
    let password2 = document.getElementById("new-pass2").value
    let errorMsg = document.getElementById("new-pass2-error")

    if (password !== "" && password !== password2) {
        fieldState["newPass2"] = false
        errorMsg.className = "error-mes"
        errorMsg.innerText = newPass2Message
    } else if (password !== "") {
        fieldState["newPass2"] = true
        errorMsg.className = "error-mes-hidden"
        errorMsg.innerText = ""
    }
}

onSubmitData = async function (e) {
    e.preventDefault()
    var valid = true
    let errorMsg = document.getElementById("old-pass-error")

    if (!fieldState["oldPass"]) {
        valid = false
        validateOldPass()
    }
    if (!fieldState["newPass1"]) {
        valid = false       
        validateNewPass1()
    }
    if (!fieldState["newPass2"]) {
        valid = false
        validateNewPass2()
    }
    
    if (valid) {
        let data = new FormData(passForm)
        let response = await fetch('/user', {method: 'POST', body: data})

        if (response.status === 400) {
            data = await response.json()
            
            if (data.errors && data.errors.old_pass) {
                errorMsg.className = "error-mes"
                errorMsg.innerText = data.errors.old_pass
            }
        } else {
            window.location.reload()
            alert("Password changed successfully")
        }
    }    
}