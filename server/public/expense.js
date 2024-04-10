// let url = "http://localhost:3000"
let url = "http://54.80.220.110:3000"
let editId;
let editedExpense
let token;
let currentPage = 1;
let expensesPerPage = localStorage.getItem('expensesPerPage')||5;
// let isPremium;

const select = document.querySelector('.select');
select.addEventListener('change', (event) => {
    const selectedRows = event.target.value;
    // Update the table content here based on the selected number of rows
    console.log(`Selected rows: ${selectedRows}`);
    expensesPerPage = selectedRows
    localStorage.setItem('expensesPerPage', expensesPerPage)
    getExpenses(1)
});

function handleFormSubmit(event) {
    event.preventDefault();
    const expense = {
        amount: event.target.amount.value,
        description: event.target.description.value,
        category: event.target.category.value,
        // userId: 1 //this is user Id //change the 1 later
    };

    
   
        axios.post(`${url}/expense/add-expense`, expense, { headers: { "Authorization": token } }).then(res => { //changes
           
            console.log('token', token)
            event.target.reset();
            if (localStorage.getItem('isPremium') === 'true') {
                console.log('line44')
                showLeaderBoard()

            }
            getExpenses(1);

            // renderExpenses();
        })
            .catch(err => console.log(err))
   

}


function getExpenses(page) {
    axios.get(`${url}/expense/get-expenses?page=${page}&limit=${expensesPerPage}`, {
        headers: {
            "Authorization":
                token
        }
    })
        .then((response) => {
            console.log(response)
            renderExpenses(response.data.expenses);
            updatePagination(response.data);
        })
        .catch((error) => {
            console.error('Error fetching expenses:', error);
        });
}


function renderExpenses(expenses) {//changed line 56 and 57 also
    console.log(expenses)
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = '';

    expenses.forEach((expense, index) => {
        const id = expense.id;
        console.log(expense.id)
        console.log(expense)
        let newExpense = JSON.stringify(expense)
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
      ${expense.amount} - ${expense.description} - ${expense.category} 
      <button type="button" class="btn btn-danger btn-sm float-right ml-2" onclick="deleteExpense(${id})">Delete</button>
    `;
        expensesList.appendChild(li);
    });
}


function updatePagination({
    currentPage,
    hasNextPage,
    nextPage,
    hasPreviousPage,
    previousPage,
    lastPage
}) {

    pagination.innerHTML = '';

    if (hasPreviousPage) {
        const btn2=document.createElement('button')
        btn2.innerHTML = previousPage
        btn2.addEventListener('click',()=>{getExpenses(previousPage)})
        pagination.appendChild(btn2)

    }
    const btn1 = document.createElement('button')
    btn1.innerHTML = currentPage
    btn1.addEventListener('click', () => { getExpenses(currentPage) })
    pagination.appendChild(btn1)
    if (hasNextPage) {
        const btn3 = document.createElement('button')
        btn3.innerHTML = nextPage
        btn3.addEventListener('click', () => { getExpenses(nextPage) })
        pagination.appendChild(btn3)
    }
}

function deleteExpense(id) {

    console.log(id)
    const deleteUrl = `${url}/expense/delete-expense/${id}`;

    axios.delete(deleteUrl, { headers: { "Authorization": token } }) 
        .then(response => {
            console.log('Expense deleted successfully:', response.data);
            getExpenses(1); // Refresh the expenses list after deletion
            showLeaderBoard()
        })
        .catch(error => {
            console.error('Error deleting expense:', error);
        });
}



function checkPremium(value) {

    const button = document.getElementById('razoorpay-button');
    const text = document.getElementById('premium-text')
    const leaderBoard = document.getElementById("leaderBoard-button")
    const salaryForm = document.getElementById('salary-form')
    // console.log(token)
    const reportBtn = document.getElementById('report-button'); 
    if (!value) {
        button.style.display = "inline-block";  //make the button visible
        text.style.display = "none";
        leaderBoard.style.display = "none"
        salaryForm.style.display = "none"
        reportBtn.style.display = "none" 
    }
    else {
        button.style.display = "none";  //Hide the button
        text.style.display = "inline-block";
        leaderBoard.style.display = "inline-block"
        salaryForm.style.display = "inline-block"
        reportBtn.style.display = "inline-block" 

    }
}

function showReport() {

    window.location.href = 'report.html';
}

function razoorpayfunction(event) {
    console.log("razoorpay clicked");
    axios.get(`${url}/purchase/premium-membership`, { headers: { "Authorization": token } })
        .then(async (res) => {
            console.log(res);
            const options = {
                "key": res.data.key_id,
                "order_id": res.data.order.id,
                "handler": async function (res) {
                    try {
                        await axios.post(`${url}/purchase/updateTransactionStatus`, {
                            order_id: options.order_id,
                            payment_id: res.razorpay_payment_id
                        }, { headers: { "Authorization": token } });
                        localStorage.setItem('isPremium', 'true')
                        checkPremium(true)
                        alert('You are a premium User now');
                    } catch (error) {
                        console.error('Error updating transaction status:', error);
                        alert("Something went wrong");
                    }
                }
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();
            event.preventDefault();

            rzp1.on('payment.failed', function (res) {
                console.log(res, 'going to backend to make changes in db as status failed');
                console.log(options.order_id);

                const updateFailedPromise = axios.post(`${url}/purchase/updateTransactionStatus/failed`, {
                    order_id: options.order_id
                }, { headers: { "Authorization": token } });

                const alertPromise = new Promise((resolve) => {
                    alert("Something went very wrong");
                    resolve();
                });

                return Promise.all([updateFailedPromise, alertPromise])
                    .catch(err => console.log(err));
            });

        }).catch((err) => {
            console.log(err);
        });
}

function showLeaderBoard() {
    console.log("inside LeaderBoard")
    axios.get(`${url}/purchase/leaderboard`).then((data) => { 

        console.log(data)
        renderLeaderBoard(data.data)
    })
}

function renderLeaderBoard(expenses) {
    console.log(expenses)
    const expensesList = document.getElementById('LeaderBoard');
    expensesList.innerHTML = '';

    expenses.forEach((expense, index) => {
        const id = expense.id;
        // console.log(expense.id)
        // console.log(expense)
        let newExpense = JSON.stringify(expense)
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = ` ${expense.name} - ${expense.totalexpense}  `;
        expensesList.appendChild(li);
    });
}

function handleSalarySubmit(event) {
    event.preventDefault();
    const salary = document.getElementById('salary').value
    addSalary(salary)
    event.target.reset();
}

function addSalary(data) {
    console.log(data)
    axios.post(`${url}/salary/add-salary`, { salary: data }, { headers: { "Authorization": token } }).then((res) => {
        console.log(res)
    }).catch((err) => {
        console.log(err)
    })
}

function getUserDetails() {
    axios.get(`${url}/user/details`, { headers: { "Authorization": token } }).then((res) => {
        console.log(res)
    }).catch((err) => {
        console.log(err)
    })
}
window.addEventListener('DOMContentLoaded', () => { 
    token = localStorage.getItem('token')
    checkPremium(localStorage.getItem('isPremium') === 'true')
    getExpenses(1)
});