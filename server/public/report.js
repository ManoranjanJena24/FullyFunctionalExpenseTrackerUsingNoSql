// let url = "http://localhost:3000"
let url = "http://54.80.220.110:3000"
let token;

function showReport() {
    console.log('report generated')
    document.getElementById('view-report-btn').style.display = 'none'
    document.getElementById('yearlyTable').innerHTML = 'Yearly Report'
    document.getElementById('monthSelect').removeAttribute('hidden');

    const monthSelect = document.getElementById('monthSelect');
    const selectedMonth = monthSelect.options[monthSelect.selectedIndex].text;
    const selectedMonthValue = monthSelect.value;
    console.log(selectedMonth)


    const expensesPromise = axios.get(`${url}/expense/get-expenses-report`, { headers: { "Authorization": token } });
    const salariesPromise = axios.get(`${url}/salary/get-salaries`, { headers: { "Authorization": token } });

    Promise.all([expensesPromise, salariesPromise])
        .then(([expensesResponse, salariesResponse]) => {
            const expensesData = expensesResponse.data;
            const salariesData = salariesResponse.data;

            console.log('All expenses: ', expensesData);
            console.log('All salaries: ', salariesData);

            const reportData = expensesData.concat(salariesData);
            reportData.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
            console.log('Sorted report data: ', reportData);

            renderTable(reportData, selectedMonth);
            renderMonthlySummary(reportData);
        })
        .catch(err => {
            console.log(err);
        });


}
function renderTable(reportData, selectedMonth) {
    console.log('data to be rendered', reportData);

    let tableRows = '';
    let totalIncome = 0;
    let totalExpense = 0;
    let currentDate = null;
    let totalSavings = 0;
    let totalExpenseMonth = 0;
    let totalIncomeMonth = 0;
    console.log(selectedMonth)
    reportData.forEach(item => {
        const date = new Date(item.updatedAt);
        const month = date.toLocaleString('default', { month: 'long' });
        console.log(month)
        // Check if the date is in the selected month
        if (month === selectedMonth) {
            // Check if the date has changed
            if (date.toLocaleDateString() !== currentDate) {
                // Add total row for the previous date
                if (currentDate) {
                    tableRows += `<tr style="background-color: #F5F5F5;">
                                        <td colspan="3">Total for ${currentDate}</td>
                                        <td><strong>${totalIncome}</td>
                                        <td><strong>${totalExpense}</td>
                                      </tr>`;
                    // Reset total income and expense for the new date
                    totalIncome = 0;
                    totalExpense = 0;
                }
                currentDate = date.toLocaleDateString();
            }

            if ('amount' in item) { // Check if it's an expense
                tableRows += `<tr>
                                    <td>${date.toLocaleDateString()}</td>
                                    <td>${item.description}</td>
                                    <td>${item.category}</td>
                                    <td></td>
                                    <td>${item.amount}</td>
                                  </tr>`;
                totalExpense += item.amount;
                totalExpenseMonth += item.amount;
            } else { // It's a salary
                tableRows += `<tr>
                                    <td>${date.toLocaleDateString()}</td>
                                    <td></td>
                                    <td></td>
                                    <td>${item.salary}</td>
                                    <td></td>
                                  </tr>`;
                totalIncome += item.salary;
                totalIncomeMonth += item.salary;
            }
        }
    });

    // Add total row for the last date
    if (currentDate) {
        tableRows += `<tr style="background-color: #F5F5F5;">
                                <td colspan="3">Total for ${currentDate}</td>
                                <td><strong>${totalIncome}</td>
                                <td><strong>${totalExpense}</td>
                              </tr>`;
    }

    // Generate savings row
    totalSavings = totalIncomeMonth - totalExpenseMonth;
    tableRows += `<tr style="background-color: #F5F5F5;">
            <td colspan="3"></td>
            <td style="color: green;"><strong>₹${totalIncomeMonth}</td>
            <td style="color: red;"><strong>₹${totalExpenseMonth}</td>
             </tr>`;
    tableRows += `<tr style="background-color: #F5F5F5;">
            <td colspan="3"></td>
                            <td style="color: blue;"><strong>₹Total Savings</td>
                          
                            <td style="color: blue;"><strong>₹${totalSavings}</td>
                          </tr>`;

    const tableBody = document.getElementById('expenseSalaryTableBody');
    tableBody.innerHTML = tableRows;

    // Set the title of the table as the selected month
    document.getElementById('tableTitle').innerText = selectedMonth;

    // Show the table
    document.getElementById('expenseSalaryTable').removeAttribute('hidden');
}
function renderMonthlySummary(reportData) {
    const monthlySummaryTableBody = document.getElementById('monthlySummaryTableBody');
    monthlySummaryTableBody.innerHTML = '';

    const monthlySummary = {};
    reportData.forEach(item => {
        const date = new Date(item.updatedAt);
        const month = date.toLocaleString('default', { month: 'long' });
        if (!monthlySummary[month]) {
            monthlySummary[month] = {
                income: 0,
                expense: 0,
                savings: 0
            };
        }
        if ('amount' in item) {
            monthlySummary[month].expense += item.amount;
        } else {
            monthlySummary[month].income += item.salary;
        }
    });

    let totalIncomeYear = 0;
    let totalExpenseYear = 0;
    let totalSavingsYear = 0;

    Object.entries(monthlySummary).forEach(([month, summary]) => {
        totalIncomeYear += summary.income;
        totalExpenseYear += summary.expense;
        summary.savings = summary.income - summary.expense;
        totalSavingsYear += summary.savings;

        const row = `<tr>
                    <td>${month}</td>
                    <td>${summary.income}</td>
                    <td>${summary.expense}</td>
                    <td>${summary.savings}</td>
                  </tr>`;
        monthlySummaryTableBody.innerHTML += row;
    });

    const totalRow = `<tr style="background-color: #F5F5F5;">
                        <td></td>
                        <td style="color: green;"><strong>₹${totalIncomeYear}</td>
                        <td style="color: red;"><strong>₹${totalExpenseYear}</td>
                        <td style="color: blue;"><strong>₹${totalSavingsYear}</td>
                      </tr>`;
    monthlySummaryTableBody.innerHTML += totalRow;

    document.getElementById('monthlySummaryTable').removeAttribute('hidden');
}

function downloadReport() {
    axios.get(`${url}/user/download`, { headers: { "Authorization": token } }).then((response) => {
        if (response.status === 200) {
            var a = document.createElement('a')
            a.href = response.data.fileUrl
            a.download='MyExpenseReport.csv'
            a.click()
        }
        else {
            alert(response.data.message)
        }
    }).catch((err) => {
        console.log(err)
    })
}


window.addEventListener('DOMContentLoaded', () => { //changed
    token = localStorage.getItem('token')
    // checkPremium(localStorage.getItem('isPremium') === 'true')


});
