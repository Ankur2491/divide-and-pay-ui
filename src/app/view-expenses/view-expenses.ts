import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    standalone: true,
    selector: 'app-view-expenses',
    imports: [CommonModule, CardModule, SelectModule, ReactiveFormsModule, FloatLabelModule, InputNumberModule, CheckboxModule, ButtonModule, ToastModule, ProgressSpinnerModule],
    providers: [MessageService],
    templateUrl: './view-expenses.html',
    styleUrls: ['./view-expenses.css'],
})
export class ViewExpenses implements OnInit {
    private http = inject(HttpClient);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    public expenseGroup = signal<string>('');
    public expenses = signal<any[]>([]);
    public expenseGroupObj = signal<any>(null);
    private messageService = inject(MessageService);
    loading = signal<boolean>(false);
    expensesForm = this.fb.group({
        expenses: this.fb.array<FormGroup>([])
    });
    editingIndex = signal<number | null>(null);
    groupId: any;

    get expensesArray() {
        return this.expensesForm.get('expenses') as FormArray;
    }

    loadExpenses(expenses: any[]) {
        const formGroups = expenses.map(expense =>
            this.fb.group({
                expenseId: [expense.expenseId],
                expenseName: [expense.expenseName],
                amount: [expense.amount],
                paidBy: [expense.paidBy],
                splitAmong: this.fb.array(
                    this.members.map((member: any) =>
                        expense.splitAmong.includes(member)
                    ))
            })
        );
        this.expensesForm.setControl('expenses', this.fb.array(formGroups));
    }

    getGroupExpenses() {
        this.loading.set(true);
        this.http.get(`http://localhost:3000/getGroupData?groupId=${this.groupId}`)
            .subscribe((data: any) => {
                this.loading.set(false);
                this.expenseGroup.set(`Expenses for: ${data?.groupName}`);
                this.expenses.set(data?.expenses);
                this.expenseGroupObj.set(data);
                this.loadExpenses(this.expenses());
            });
    }

    ngOnInit() {
        this.groupId = this.activatedRoute.snapshot.paramMap.get('id');
        this.getGroupExpenses();
    }
    get members() {
        return this.expenseGroupObj()?.members;
    }

    editExpense(index: number) {
        this.editingIndex.set(index);
    }

    saveExpense(index: number) {
        const expense =
            this.expensesArray.at(index).value;
        let splitAmongBooleans = expense.splitAmong;
        expense.splitAmong = this.selectedMembers(splitAmongBooleans);
        this.loading.set(true);
        this.http.put(
            `http://localhost:3000/edit/expense?groupId=${this.groupId}`,
            expense
        ).subscribe(() => {
            this.loading.set(false);
            this.editingIndex.set(null);
            this.messageService.add(
                    { severity: 'success', summary: 'Success', detail: `Expense updated successfully!` });
        });
    }

    deleteExpense(index: number) {
        this.loading.set(true);
        const expense =
            this.expensesArray.at(index).value;
        this.http.delete(`http://localhost:3000/delete/expense?groupId=${this.groupId}&expenseId=${expense.expenseId}`)
            .subscribe(() => {
                this.loading.set(false);
                this.getGroupExpenses()
                this.messageService.add(
                    { severity: 'error', summary: 'Success', detail: `Expense deleted successfully!` });
            });
    }

    selectedMembers(splitAmongBooleans: any) {
        return this.members.filter(
            (_: string, index: number) =>
                splitAmongBooleans.at(index)
        );
    }

    addExp() {
        this.router.navigate([`/group/${this.groupId}`]);
    }
}