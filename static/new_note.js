var receiversList = []
var receiversPane = null
var receivers = null
var addButton = null
var receiverSelect = null
var reg = new RegExp("\\S")
var lenReg1 = new RegExp("^[\\s\\S]{0,120}$")
var lenReg2 = new RegExp("^[\\s\\S]{0,1000}$")
var titleMessage = "Title cannot be empty"
var titleMessage2 = "Title cannot have more than 120 characters"
var contentMessage = "Content cannot be empty"
var contentMessage2 = "Content cannot have more than 1000 characters"
var noteForm = null

var fieldState = {
    "title": false,
    "content": false
}

window.onload = function () {
    receiversPane = document.getElementById("receiversPane")
    receivers = document.getElementById("receivers")
    receiverSelect = document.getElementById("user-select")
    document.getElementById("public").addEventListener("change", changeReceiversVisibility)
    document.getElementById("public").addEventListener("change", flushReceiversList)
    receiverSelect.addEventListener("click", changeAddButtonState)
    addButton = document.getElementById("add_del_button")
    addButton.addEventListener("click", addOrDeleteReceiver)

    document.getElementById("title").addEventListener("change", validateTitle)
    document.getElementById("content").addEventListener("change", validateContent)

    noteForm = document.getElementById("noteform")
    noteForm.addEventListener("submit", onSubmitData)
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax
    while (L && this.length) {
        what = a[--L]
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1)
        }
    }
    return this
}

validateTitle = function () {
    let title = document.getElementById("title").value
    let errorMsg = document.getElementById("title-error")

    if (reg.test(title)) {
        errorMsg.className = "error-mes-hidden"
        errorMsg.innerText = ""
        fieldState['title'] = true

        if (!lenReg1.test(title)) {
            fieldState['title'] = false
            errorMsg.className = "error-mes"
            errorMsg.innerText = titleMessage2
        }
                    
    } else {
        fieldState['title'] = false
        errorMsg.className = "error-mes"
        errorMsg.innerText = titleMessage
    }
}

validateContent = function () {
    let content = document.getElementById("content").value
    let errorMsg = document.getElementById("content-error")

    if (reg.test(content)) {
        errorMsg.className = "error-mes-hidden"
        errorMsg.innerText = ""
        fieldState['content'] = true

        if (!lenReg2.test(content)) {
            fieldState['content'] = false
            errorMsg.className = "error-mes"
            errorMsg.innerText = contentMessage2
        }
                    
    } else {
        fieldState['content'] = false
        errorMsg.className = "error-mes"
        errorMsg.innerText = contentMessage
    }
}

changeReceiversVisibility = function() {
    if (this.checked) {
        receiversPane.style.visibility = "hidden"
    } else {
        receiversPane.style.visibility = "visible"
    }
}

flushReceiversList = function() {
    if (this.checked) {
        receivers.textContent = ""
        receiversList = []
        addButton.textContent = "Add a receiver"
    } 
}

changeAddButtonState = function() {
    let selected = this.value
    if (receiversList.includes(selected)) {
        addButton.textContent = "Delete a receiver"
    } else {
        addButton.textContent = "Add a receiver"
    }
}

addOrDeleteReceiver = function() {
    let selected = receiverSelect.value
    if (receiversList.includes(selected)) {
        receiversList.remove(selected)
        addButton.textContent = "Add a receiver"
    } else {
        receiversList.push(selected)
        addButton.textContent = "Delete a receiver"
    }

    receivers.textContent = receiversList.join(", ")
}

onSubmitData = async function (e) {
    e.preventDefault()
    var valid = true

    if (!fieldState["title"]) {
        valid = false
        validateTitle()
    }
    if (!fieldState["content"]) {
        valid = false       
        validateContent()
    }
       
    if (valid) {
        let data = new FormData(noteForm)
        if (receiversList.length !== 0) {
            data.append("receivers", receiversList.join(","))
        }

        let response = await fetch('/user/notes/new', {method: 'POST', body: data})

        if (response.status === 201) {
            window.location.href = "/user/notes"
        } 
    }    
}