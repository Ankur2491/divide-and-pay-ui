import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [ReactiveFormsModule, ButtonModule, ProgressSpinnerModule]
})
export class Home {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private router =inject(Router);
  loading = signal<boolean>(false);
  groupForm = this.fb.group({
    groupId: ['', Validators.required]
  })
  groupId: string = 'a8811a7e-eea5-4c92-b0bb-e9cf5d2d6955';
  getSummary() {
    this.http.get(`http://localhost:3000/getGroupData?groupId=${this.groupId}`).subscribe((data) => {
      this.calculateSplit(data);
    });
  }
  calculateSplit(groupData: any) {
    console.log('Group Data:', groupData);
    let summary: any = {};
    groupData.members.forEach((member: any) => {
      summary[member] = { paid: 0, consumed: 0, net: 0 };
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

    for (let member in summary) {
      summary[member].net = summary[member].paid - summary[member].consumed;
    }
    console.log('Summary:', summary);
  }

  searchGroup() {
    let groupId = this.groupForm.value?.groupId;
    if (groupId) {
      this.loading.set(true);
      this.http.get(`https://split-api-chi.vercel.app/getGroupData?groupId=${groupId}`).subscribe(data => {
        if (data) {
          this.loading.set(false);
          this.router.navigate([`/group/${groupId}`]);
        }
      })
    }
  }
}
