var passReg = new RegExp("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,72}$")
var usernameReg = new RegExp("^[a-zA-Z0-9]{3,12}$")
var usernameMessage = "Username must contain between 3 to 12 alphanumeric characters"
var passwordMessage = "Password must consist of 8-72 characters, including a letter, a number and a special character"
var password2Message = "Passwords must match"


var fieldState = {
    "username": false,
    "password": false,
    "password2": false
}

window.onload = function () {
    regForm = document.getElementById("regform")
    regForm.addEventListener("submit", onSubmitData)

    document.getElementById("username").addEventListener("change", validateUsername)
    document.getElementById("password").addEventListener("change", validatePassword)
    document.getElementById("password2").addEventListener("change", validatePassword2)
}

validateUsername = function () {
    var username = document.getElementById("username").value
    var errorMsg = document.getElementById("username-error")

    if (usernameReg.test(username)) {
        errorMsg.className = "error-mes-hidden"
        errorMsg.innerText = ""
        fieldState['username'] = true
                    
    } else {
        fieldState['login'] = false
        errorMsg.className = "error-mes"
        errorMsg.innerText = usernameMessage
    }
}

validatePassword = function () {
    var password = document.getElementById("password").value
    var errorMsg = document.getElementById("password-error")

    if (passReg.test(password)) {
        fieldState['password'] = true
        errorMsg.className = "error-mes-hidden"
        errorMsg.innerText = ""
    } else {
        fieldState['password'] = false
        errorMsg.className = "error-mes"
        errorMsg.innerText = passwordMessage
    }
}

validatePassword2 = function () {
    var password = document.getElementById("password").value
    var password2 = document.getElementById("password2").value
    var errorMsg = document.getElementById("password2-error")

    if (password !== "" && password !== password2) {
        fieldState['password2'] = false
        errorMsg.className = "error-mes"
        errorMsg.innerText = password2Message
    } else if (password !== "") {
        fieldState['password2'] = true
        errorMsg.className = "error-mes-hidden"
        errorMsg.innerText = ""
    }
}

onSubmitData = async function (e) {
    e.preventDefault()
    var valid = true
    var usernameErrorMsg = document.getElementById("username-error")
    var emailErrorMsg = document.getElementById("email-error")
    var passwordErrorMsg = document.getElementById("password-error")
    var password2ErrorMsg = document.getElementById("password2-error")

    if (!fieldState["username"]) {
        valid = false
        usernameErrorMsg.className = "error-mes"
        usernameErrorMsg.innerText = usernameMessage
    }
    if (!fieldState["password"]) {
        valid = false       
        passwordErrorMsg.className = "error-mes"
        passwordErrorMsg.innerText = passwordMessage
    }
    if (!fieldState["password2"]) {
        valid = false
        password2ErrorMsg.className = "error-mes"
        password2ErrorMsg.innerText = password2Message
    }
    
    if (valid) {
        let data = new FormData(regForm)
        let response = await fetch('/sign-up', {method: 'POST', body: data})

        if (response.status === 400) {
            data = await response.json()
            
            if (data.errors && data.errors.username) {
                usernameErrorMsg.className = "error-mes"
                usernameErrorMsg.innerText = data.errors.username
            }
            if (data.errors && data.errors.email) {
                emailErrorMsg.className = "error-mes"
                emailErrorMsg.innerText = data.errors.email
            }
        } else {
            window.location.href = "/sign-in"
        }
    }    
}