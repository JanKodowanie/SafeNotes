var emailReg = new RegExp("\\S")
var emailMessage = "Email field cannot be empty"
var submitMessage = "Password reset link was sent to your email!"
var resetForm = null

var fieldState = {
    "email": false
}

window.onload = function () {
    resetForm = document.getElementById("password-reset")
    resetForm.addEventListener("submit", onSubmitData)

    document.getElementById("email").addEventListener("change", validateEmail)
}

validateEmail = function () {
    let email = document.getElementById("email").value
    let errorMsg = document.getElementById("pass-message")

    if (emailReg.test(email)) {
        fieldState["email"] = true
        errorMsg.className = "error-mes-hidden"
        errorMsg.innerText = ""
    } else {
        fieldState["email"] = false
        errorMsg.className = "error-mes"
        errorMsg.innerText = emailMessage
    }
}

onSubmitData = async function (e) {
    e.preventDefault()
    let valid = true
    let msg = document.getElementById("pass-message")

    if (!fieldState["email"]) {
        valid = false
        validateEmail()
    }
    
    if (valid) {
        let data = new FormData(resetForm)
        let response = await fetch('/password-reset-request', {method: 'POST', body: data})

        if (response.status === 201) {
            msg.className = "error-mes"
            msg.innerText = "Password reset link was sent to your email!"
            msg.style.color = "#008000"
        }
    }    
}