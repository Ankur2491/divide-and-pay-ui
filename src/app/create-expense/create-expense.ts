import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { v4 as uuidv4 } from 'uuid';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-create-expense',
  imports: [CardModule, ReactiveFormsModule, FloatLabelModule, InputTextModule, ChipModule, ButtonModule, ToastModule, RippleModule],
  providers: [MessageService],
  templateUrl: './create-expense.html',
  styleUrl: './create-expense.css',
})
export class CreateExpense {
  groupObject: any = null;
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private http = inject(HttpClient);
  expenseForm = this.fb.group({
    groupName: ['', Validators.required],
    members: this.fb.array([]),
    memberName: ['']
  });

  get members(): FormArray {
    return this.expenseForm.get('members') as FormArray;
  }
  get groupName() {
    return this.expenseForm.get('groupName')?.value;
  }

  addMember() {
    const name = this.expenseForm.get('memberName')?.value;
    if (name) {
      this.members.push(this.fb.control(name));
      this.expenseForm.get('memberName')?.reset();
    }
  }

  removeMember(index: number) {
    this.members.removeAt(index);
  }

  createGroup() {
    const { memberName, ...groupData } = this.expenseForm.value;
    this.groupObject = groupData;
    this.groupObject['_id'] = uuidv4();
    this.groupObject['expenses'] = [];
    console.log('Group Created:', this.groupObject);
    this.http.post('https://split-api-chi.vercel.app/createGroup', this.groupObject).subscribe((data)=>{
      console.log(data);
    });
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Group "${this.groupObject.groupName}" created successfully!` });
    this.expenseForm.reset();
    this.expenseForm.setControl('members', this.fb.array([]));
    this.router.navigate([`/group/${this.groupObject._id}`], {
      state: { group: this.groupObject }
    });
  }
}
