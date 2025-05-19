import { Component , OnInit } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';


@Component({
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzCheckboxModule,
    NzButtonModule,
    NzIconModule,
  NzCardModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm!:FormGroup; // le groupe des champs du formulaire
  
  constructor(private fb:FormBuilder , 
    private login: LoginService , 
    private message: NzMessageService ,
    private router: Router/*service pour afficher les erreurs */) { 
   }
   ngOnInit() {
    this.loginForm = this.fb.group({
      email: [null,[Validators.required]],

      password: [null,[Validators.required]],

      remember: [true]}
    ); //case coché par defaut
  }
  
   onSubmit() {
    this.login.loginAdmin(this.loginForm).subscribe({
      next: (response: { token: string; }) => {
      },
      error: (error) => {
        console.error('Erreur de connexion', error);
      }
    });
  }

  
 
  submitForm() {
    this.login.loginAdmin(this.loginForm.value).subscribe(res=>{
      console.log(res);
      this.router.navigate(['/dashboard']);

    },
      
      
      errors=>{
        this.message.error("Login ou mot de passe incorrect"), { nzDuration : 2000 };

    })

}
}