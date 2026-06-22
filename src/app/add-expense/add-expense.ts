import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, OnInit, signal, effect } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-expense',
  imports: [CardModule, SelectModule, ReactiveFormsModule, FloatLabelModule, InputNumberModule, CheckboxModule, ButtonModule, ToastModule, RouterLink, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.css',
})
export class AddExpense implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private http = inject(HttpClient);
  public groupObject = signal<any>(null);
  public headerText = signal<string>('');
  loading = signal<boolean>(false);
  addExpenseForm: any;
  groupId: any;
  settlementArray: any[] = [];
  fetchGroupData(groupId: string) {
    this.loading.set(true);
    this.http.get(`https://split-api-chi.vercel.app/getGroupData?groupId=${groupId}`).subscribe(groupObj => {
      this.loading.set(false);
      this.groupObject.set(groupObj);
      this.updateFormWithGroupData();
      this.headerText.set(this.groupObject() ? `Add Expense to Group: ${this.groupObject()?.groupName}` : 'Add Expense');
      this.calculateSplit(this.groupObject())
    });
  }

  private updateFormWithGroupData() {
    const members = this.groupObject()?.members || [];
    this.addExpenseForm.setControl('splitAmong', this.fb.array(members.map((member: any) => this.fb.control(true))));
  }
  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as any || history.state;
    this.groupId = this.activatedRoute.snapshot.paramMap.get('id');

    // Initialize form with empty splitAmong array first
    this.addExpenseForm = this.fb.group({
      expenseId: [''],
      expenseName: ['', Validators.required],
      amount: ['', Validators.required],
      paidBy: ['', Validators.required],
      splitAmong: this.fb.array([]),
    });

    // Set group data and rebuild form
    if (!state?.group) {
      this.fetchGroupData(this.groupId);
    } else {
      this.groupObject.set(state?.group);
      this.updateFormWithGroupData();
    }
    this.headerText.set(this.groupObject() ? `Add Expense to Group: ${this.groupObject()?.groupName}` : 'Add Expense');
    if (this.groupObject()) {
      this.calculateSplit(this.groupObject());
    }
  }
  addExpense() {
    const { splitAmong, ...expenseData } = this.addExpenseForm.value;
    expenseData.groupId = this.groupId;
    expenseData.expenseId = uuidv4();
    expenseData.splitAmong = this.selectedMembers;
    this.loading.set(true);
    this.http.post('https://split-api-chi.vercel.app/addExpense', expenseData).subscribe((data) => {
      this.loading.set(false);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Expense added successfully!` });
      this.addExpenseForm.reset();
      this.addExpenseForm.setControl('splitAmong', this.fb.array(this.groupObject()?.members?.map((_: any) => this.fb.control(true)) || []));
      this.fetchGroupData(this.groupId);
    });

  }
  get members() {
    return this.groupObject()?.members || [];
  }
  get splitAmong() {
    return this.addExpenseForm.get('splitAmong') as FormArray;
  }
  get selectedMembers() {
    return this.members.filter(
      (_: string, index: number) =>
        this.splitAmong.at(index).value
    );
  }
  viewAndEditExpenses() {
    this.router.navigate([`/expenses/${this.groupId}`]);
  }

  calculateSplit(groupData: any) {
    console.log('Group Data:', groupData);
    let summary: any = {};
    groupData.members.forEach((member: any) => {
      summary[member] = { memberName: member, paid: 0, consumed: 0, net: 0 };
    });
    groupData.expenses.forEach((expense: any) => {
      if (expense.splitAmong.length === 1) {
        summary[expense.paidBy].paid += expense.amount;
        summary[expense.splitAmong[0]].consumed += expense.amount;
      }
      else {
        summary[expense.paidBy].paid += expense.amount;
        expense.splitAmong.forEach((member: any) => {
          summary[member].consumed += expense.amount / expense.splitAmong.length;
        });
      }
    });
    let finalArray: any = Object.entries(summary).map(x=>x[1]);
    finalArray.sort((x: any,y: any)=> (x.paid-x.consumed) - (y.paid-y.consumed));
    finalArray.forEach((obj: any)=>{
      obj.net = obj.paid - obj.consumed;
    })
    let i = 0;
    let j = finalArray.length-1;
    let finalSettlementArray = [];
    while(i<j) {
      if(Math.abs(finalArray[i].net) == 0) {
        i++;
      }
      else if(Math.abs(finalArray[j].net) == 0) {
        j--;
      }
      else if(finalArray[i].net<finalArray[j].net) {
        let obj1 = Object.assign({}, finalArray[i])
        let obj2 = Object.assign({}, finalArray[j])
        let valueToSubtract = Math.min(Math.abs(obj1.net), Math.abs(obj2.net));
        let originalSignObj1 = obj1.net>0;
        let originalSignObj2 = obj2.net>0;
        obj2.net = originalSignObj2 ? Math.abs(obj2.net) - Math.abs(valueToSubtract): - (Math.abs(obj2.net) - Math.abs(valueToSubtract));
        obj1.net = originalSignObj1 ? Math.abs(obj1.net) - Math.abs(valueToSubtract): - (Math.abs(obj1.net) - Math.abs(valueToSubtract));
        let settlementString = `${obj1.memberName} to pay ${obj2.memberName} -> ${Math.abs(valueToSubtract)}`
        finalSettlementArray.push(settlementString);
        finalArray[i] = obj1;
        finalArray[j] = obj2;
      }
    }
    this.settlementArray = finalSettlementArray
  }
}
