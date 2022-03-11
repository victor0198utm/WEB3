"use strict";

class ListItem {
    constructor(id, task, imageURL, dateFor, status) {
        this.id = id
        this.task = task
        this.imageURL = imageURL
        dateFor = new Date(dateFor)
        this.dateFor = dateToString(dateFor)
        // true for marking as "not done"
        this.status = status || false
    }

    static buildObjectFromJSON(JSONItem){
        return new ListItem(JSONItem.id, JSONItem.task, JSONItem.imageURL, JSONItem.dateFor, JSONItem.status)
    }

    buildHTMLItem(){
        let itemElement = document.createElement('div')
        itemElement.className = 'list-item'
        itemElement.id = 'item' + this.id

        let itemLeftElement = document.createElement('div')
        itemLeftElement.className = 'left-content'

        let checkElement = document.createElement('input')
        checkElement.type = 'checkbox'
        checkElement.id = 'ch' + this.id
        
        if (this.status == true)
            checkElement.checked = true
            itemLeftElement.appendChild(checkElement)

        let accentElement = document.createElement('div')
        accentElement.className = 'accent'

        if (this.imageURL){
            let imgElement = document.createElement('img')
            imgElement.className = 'img-item'
            imgElement.src = this.imageURL
            accentElement.appendChild(imgElement)
        }        

        if (this.task){
            let paragraphElement = document.createElement('p')
            paragraphElement.className = 'text-item'
            paragraphElement.innerHTML = this.task
            accentElement.appendChild(paragraphElement)
        }

        itemLeftElement.appendChild(accentElement)

        let itemRightElement = document.createElement('div')
        itemRightElement.className = 'right-content'

        let dateElement = document.createElement('p')
        dateElement.className = 'date-for'
        dateElement.innerHTML = this.dateFor
        itemRightElement.appendChild(dateElement)

        let buttonElement = document.createElement('button')
        buttonElement.className = 'remove-btn'
        buttonElement.innerHTML = 'remove'
        buttonElement.id = 'rb' + this.id
        itemRightElement.appendChild(buttonElement)
        
        itemElement.appendChild(itemLeftElement)
        itemElement.appendChild(itemRightElement)

        buttonElement.onclick = ((e) => {
            let btnID = e.target.id
            let itemIndex = btnID.substring(2)
            theList.removeWithIndex(itemIndex)
            itemElement.remove()
            saveInLocalStorage()
        })

        checkElement.onchange = ((e) => {
            let btnID = e.target.id
            let itemIndex = btnID.substring(2)
            for(let i=0; i<theList.allItems.length; i++){
                if(theList.allItems[i].id == itemIndex){
                    theList.allItems[i].status = !theList.allItems[i].status
                }
            }
            saveInLocalStorage()
        })

        return itemElement
    }
}

class ItemsList {
    constructor(){
      this.Items = []
    }
    // create a new task and save it in the collection
    add_item(oneItem){
      this.Items.push(oneItem)
      return oneItem
    }
    removeWithIndex(itemIndex){
        console.log("in removeWithIndex(), items:"+ this.numberOfItems)
        for(let i=0; i<this.numberOfItems; i++){
            console.log("itemIndex:", itemIndex)
            console.log("this.Items[i].ID", this.Items[i].id)
            if (this.Items[i].id == itemIndex){
                this.Items.splice(i, 1);
                console.log("removed", i)
            }
        }
    }
    get allItems(){
        return this.Items
    }
    get numberOfItems(){
        return this.Items.length
    }
}

let ID = 0;
let theList = new ItemsList()
let showItems = 'all'
let dateAll
let dateToday
let dateOther

const removeChilds = (parent) => {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
}

const changeCalendarState = (active) => {
    let calendar = document.getElementById("date-show")
    calendar.disabled = !active
}

const dateToString = (dateFor) => {
    return dateFor.getFullYear() + '-' + (dateFor.getMonth()+1) + '-' + dateFor.getDate()
}

const setCheckbox = (checkbox, checked) => {
    checkbox.checked = checked
}

const filterDateOrNow = (calendar) => {
    return new Date(calendar.value || new Date())
}

const saveInLocalStorage = () => {
    console.log("saving", theList)
    localStorage.notToDOList = JSON.stringify(theList)
    localStorage.notToDOID = ID
    localStorage.notToDOListShow = showItems
}

window.onload = () => {
    console.log("Loading", theList)
    if (typeof localStorage.notToDOList !== 'undefined'){
        let JSONList = JSON.parse(localStorage.notToDOList).Items

        for(let i=0; i<JSONList.length; i++){
            theList.add_item(ListItem.buildObjectFromJSON(JSONList[i]))
        }
    }
    if (typeof localStorage.notToDOID !== 'undefined'){
        ID = parseInt(localStorage.notToDOID)
    }

    if (typeof localStorage.notToDOListShow !== 'undefined'){
        showItems = localStorage.notToDOListShow
    }

    dateAll = document.getElementById("date-all")
    setCheckbox(dateAll, false)
    dateToday = document.getElementById("date-today") 
    setCheckbox(dateToday,true)
    dateOther = document.getElementById("date-other")
    setCheckbox(dateOther,false)
    changeCalendarState(false)
    document.getElementById("date-show").valueAsDate = filterDateOrNow(document.getElementById('date-show'))
    document.getElementById("date-for").valueAsDate = filterDateOrNow(document.getElementById('date-for'))

    render()
}

document.getElementById("date-all").addEventListener("change", function() {
    let input = this.checked;
    if (input == true){
        setCheckbox(dateToday, false)
        setCheckbox(dateOther, false)
        changeCalendarState(false)
    }
    render()
});

document.getElementById("date-today").addEventListener("change", function() {
    let input = this.checked;
    if (input == true){
        setCheckbox(dateAll, false)
        setCheckbox(dateOther, false)
        changeCalendarState(false)
    }
    render()
});

document.getElementById("date-other").addEventListener("change", function() {
    let input = this.checked;
    if (input == true){
        setCheckbox(dateToday, false)
        setCheckbox(dateAll, false)
        changeCalendarState(true)
    }
    render()
});

document.getElementById("date-show").addEventListener("change", function() {
    document.getElementById("date-show").valueAsDate = filterDateOrNow(document.getElementById('date-show'))
    render()
});

document.getElementById("date-for").addEventListener("change", function() {
    document.getElementById("date-for").valueAsDate = filterDateOrNow(document.getElementById('date-for'))
});


function addTask() {
    let imgSrc = document.getElementById('image-link').value
    let theText = document.getElementById('text-input').value

    if(!imgSrc && !theText){
        alert("Enter at least the 'not to do' task or an image")
        return
    }

    let dateFor = new Date(document.getElementById('date-for').value || new Date())

    ID += 1

    // add new task to task list
    let newItem = new ListItem(ID, theText, imgSrc, dateFor)
    theList.add_item(newItem)

    // render the interface accordingly to the data
    render()
}

function applyFilter(){
    showItems = document.getElementById('types').value
    render()
}

function render(){
    let listElement = document.getElementById('list-items')
    removeChilds(listElement)
    let checkDate = !document.getElementById("date-all").checked
    let date = dateToString(new Date(document.getElementById('date-show').value || new Date()))
    
    for(let i=0; i<theList.allItems.length; i++){
        console.log(date)
        console.log(theList.allItems[i].dateFor)
        if((showItems == "done" && theList.allItems[i].status == false) ||
         (showItems == "active" && theList.allItems[i].status == true) ||
         (checkDate && date != theList.allItems[i].dateFor))
            continue

        let itemElement = theList.allItems[i].buildHTMLItem()
        listElement.appendChild(itemElement)
    }

    saveInLocalStorage()
}
