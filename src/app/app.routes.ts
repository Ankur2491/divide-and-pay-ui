import { Routes } from '@angular/router';
import { CreateExpense } from './create-expense/create-expense';
import { Home } from './home/home';
import { AddExpense } from './add-expense/add-expense';
import { ViewExpenses } from './view-expenses/view-expenses';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'create', component: CreateExpense },
  { path: 'group/:id', component: AddExpense},
  { path: 'expenses/:id', component: ViewExpenses }
];
