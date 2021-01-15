var errorMsg = null
var loginForm = null

window.onload = function () {
    loginForm = document.getElementById("loginform")
    loginForm.addEventListener("submit", onSubmitData)
    errorMsg = document.getElementById("signin-error")
}

onSubmitData = async function (e) {
    e.preventDefault()
    
    let data = new FormData(loginForm)
    await fetch('/sign-in', {method: 'POST', body: data}).then((response) => {
        if (response.status === 400) {
            errorMsg.className = "error-mes"
            errorMsg.innerText = "Couldn't sign in with the credentials provided!"
            result = false
        } else {
            window.location.href = "/"
        }
    })
    
}