import { login,logout } from "./login"
import { updatSettings } from "./updatedata"

const loginform = document.querySelector('.form--login')
const logOutBtn = document.getElementById('heythere')
const userdataform= document.querySelector('.form-user-data')
const userdatapassword= document.querySelector('.form-user-password')
if(loginform) {
loginform.addEventListener('submit',evt =>{  
    evt.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email,password)
})}

if(logOutBtn) logOutBtn.addEventListener('click',logout);
if(userdataform) userdataform.addEventListener('submit', e=>{
    e.preventDefault()
    const email = document.getElementById('email').value
    const name = document.getElementById('name').value
    updatSettings({name,email},"data")
    // console.log("ezsd");
})
if(userdatapassword) userdatapassword.addEventListener('submit',async e=>{
    console.log("hey")
    e.preventDefault()
    document.querySelector('.btn--save-password').textContent = "Updating...."
    const passwordCurrent = document.getElementById('password-current').value
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('password-confirm').value
    await updatSettings({passwordCurrent,password,confirmPassword},"password")
    
    document.querySelector('.btn--save-password').innerHTML = "Save Password"   
     document.getElementById('password-current').value  = " "
     document.getElementById('#password').value = " "
     document.getElementById('password-confirm').value = " "
    // console.log("ezsd");
})