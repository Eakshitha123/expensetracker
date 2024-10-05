interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  color: string; 
}

class ExpenseTracker {
  private transactions: Transaction[] = [];
  private totalIncome: number = 0;
  private totalExpenses: number = 0;
  private transactionListElement: HTMLUListElement;
  private descriptionInput: HTMLInputElement;
  private amountInput: HTMLInputElement;
  private typeSelect: HTMLSelectElement;
  private addTransactionButton: HTMLButtonElement;
  private totalIncomeDisplay: HTMLSpanElement;
  private totalExpensesDisplay: HTMLSpanElement;
  private balanceDisplay: HTMLSpanElement;
  private expenseChart: Chart;

  private colors: string[] = [
      '#FF6384', // Red
      '#36A2EB', // Blue
      '#FFCE56', // Yellow
      '#4BC0C0', // Cyan
      '#9966FF', // Purple
      '#FF9F40', // Orange
  ];

  constructor() {
      this.transactionListElement = document.getElementById("transaction-list") as HTMLUListElement;
      this.descriptionInput = document.getElementById("description-input") as HTMLInputElement;
      this.amountInput = document.getElementById("amount-input") as HTMLInputElement;
      this.typeSelect = document.getElementById("type-select") as HTMLSelectElement;
      this.addTransactionButton = document.getElementById("add-transaction-btn") as HTMLButtonElement;
      this.totalIncomeDisplay = document.getElementById("total-income") as HTMLSpanElement;
      this.totalExpensesDisplay = document.getElementById("total-expenses") as HTMLSpanElement;
      this.balanceDisplay = document.getElementById("balance") as HTMLSpanElement;

      this.addTransactionButton.onclick = () => this.addTransaction();

      this.loadTransactions(); 
      this.renderTransactions(); 
      this.updateSummary(); 
      this.setupChart(); 
  }

  private addTransaction() {
      const description = this.descriptionInput.value.trim();
      const amount = parseFloat(this.amountInput.value);
      const type = this.typeSelect.value as 'income' | 'expense';

      if (description && !isNaN(amount)) {
          const newTransaction: Transaction = {
              id: Date.now(),
              description,
              amount,
              type,
              color: this.getColorForTransaction() 
          };

          this.transactions.push(newTransaction);
          this.saveTransactions();
          this.renderTransactions();
          this.updateSummary();
          this.setupChart(); 
          this.descriptionInput.value = ""; 
          this.amountInput.value = ""; 
      } else {
          alert("Please enter a valid description and amount.");
      }
  }

  private deleteTransaction(id: number) {
      this.transactions = this.transactions.filter(transaction => transaction.id !== id);
      this.saveTransactions();
      this.renderTransactions();
      this.updateSummary();
      this.setupChart(); 
  }

  private saveTransactions() {
      localStorage.setItem("transactions", JSON.stringify(this.transactions));
  }

  private loadTransactions() {
      const transactionsJson = localStorage.getItem("transactions");
      if (transactionsJson) {
          this.transactions = JSON.parse(transactionsJson);
      }
  }

  private renderTransactions() {
      this.transactionListElement.innerHTML = "";
      for (const transaction of this.transactions) {
          const listItem = document.createElement("li");
          listItem.textContent = `${transaction.description}: $${transaction.amount} (${transaction.type})`;

          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.className = "delete-btn";
          deleteButton.onclick = () => this.deleteTransaction(transaction.id);

          listItem.appendChild(deleteButton);
          this.transactionListElement.appendChild(listItem);
      }
  }

  private updateSummary() {
      this.totalIncome = this.transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
      this.totalExpenses = this.transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

      const balance = this.totalIncome - this.totalExpenses;

      this.totalIncomeDisplay.textContent = this.totalIncome.toFixed(2);
      this.totalExpensesDisplay.textContent = this.totalExpenses.toFixed(2);
      this.balanceDisplay.textContent = balance.toFixed(2);
  }

  private setupChart() {
      const labels = this.transactions.map(t => t.description);
      const data = this.transactions.map(t => t.amount);
      const backgroundColors = this.transactions.map((t, index) => this.colors[index % this.colors.length]); // Use defined colors

      const ctx = (document.getElementById("expense-chart") as HTMLCanvasElement).getContext("2d");
      if (this.expenseChart) {
          this.expenseChart.destroy(); // Destroy the previous chart instance
      }
      this.expenseChart = new Chart(ctx, {
          type: 'pie',
          data: {
              labels: labels,
              datasets: [{
                  data: data,
                  backgroundColor: backgroundColors,
              }]
          }
      });
  }

  private getColorForTransaction(): string {
      return this.colors[this.transactions.length % this.colors.length]; // Assign color based on the count
  }
}


new ExpenseTracker();
