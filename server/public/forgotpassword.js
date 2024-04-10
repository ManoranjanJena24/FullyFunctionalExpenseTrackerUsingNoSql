

// let url = "http://localhost:3000"
let url = "http://54.80.220.110:3000"


function handleEmailSubmitForm(event) {
    console.log("inside Submit Email")
    event.preventDefault();
    const email = event.target.email.value;

    axios.post(`${url}/password/forgotpassword`, { email: email }).then((response) => {
        console.log(response)
        alert('please check your inbox for password reset link')
    }).catch((err) => {
        console.log(err)
    })

}

