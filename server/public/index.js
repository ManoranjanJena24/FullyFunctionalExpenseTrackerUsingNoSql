const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const sign_in_btn2 = document.querySelector("#sign-in-btn2");
const sign_up_btn2 = document.querySelector("#sign-up-btn2");
sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
});
sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
});
sign_up_btn2.addEventListener("click", () => {
    container.classList.add("sign-up-mode2");
});
sign_in_btn2.addEventListener("click", () => {
    container.classList.remove("sign-up-mode2");
});




// let url = "http://localhost:3000"
let url = "http://54.80.220.110:3000"

// function handleSignUpForm(event) {
//     event.preventDefault();
//     const signUpData = {
//         name: event.target.name.value,
//         email: document.getElementById('email').value,
//         password: event.target.password.value,
//     }
//     event.target.reset();
//     postSignUpData(signUpData)

// }

document.getElementById('signUpForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const errormsg = document.getElementById('errormsg');
    errormsg.innerHTML = '';

    const signUpData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    this.reset();
    postSignUpData(signUpData);
});


function postSignUpData(data) {
    axios.post(`${url}/user/signup`, data).then(() => {

    }).catch((err) => {
        console.log(err)
        const errormsg = document.getElementById('errormsg')
        errormsg.innerHTML = err.message

    })
}

// function handleSignInForm(event) {
//     event.preventDefault();
//     const errormsg = document.getElementById('errormsg')
//     errormsg.innerHTML = ''
//     const loginData = {
//         email: event.target.loginemail.value,
//         password: event.target.loginPassword.value
//     }
//     event.target.reset();
//     console.log(loginData)
//     userLogin(loginData);

// }

document.getElementById('signInForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const errormsg = document.getElementById('errormsg');
    errormsg.innerHTML = '';

    const loginData = {
        email: document.getElementById('loginemail').value,
        password: document.getElementById('loginPassword').value
    };

    this.reset();
    userLogin(loginData);
});

function userLogin(data) {
    console.log(url)
    axios.post(`${url}/user/login`, data).then((res) => {
        alert("User Loggedin succesfully")
        localStorage.setItem("user", data.email)
        console.log(res.data.token)
        console.log(res)
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('isPremium', res.data.isPremium)
        // window.location.href = '/client/expense.html'; 
        window.location.href = 'expense.html';

    }).catch((error) => {
        console.log(error.response.data.message)
        const errormsg = document.getElementById('errormsg')
        errormsg.innerHTML = error.response.data.message
        alert(error)
    })
}


// function forgotPassword() {
//     window.location.href = 'forgotpassword.html';
// }

document.getElementById('forgot-password-btn').addEventListener('click', function () {
    window.location.href = 'forgotpassword.html';
});