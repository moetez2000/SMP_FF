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

@Component({
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzCheckboxModule,
    NzButtonModule,
    NzIconModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm!:FormGroup; // le groupe des champs du formulaire
  router: any;
  
  constructor(private fb:FormBuilder , private login: LoginService , private message: NzMessageService /*service pour afficher les erreurs */) { 
   }
  
   onSubmit() {
    this.login.loginUser(this.loginForm).subscribe({
      next: (response: { token: string; }) => {
        this.router.navigate(['/admin-list']); // Redirection après login
      },
      error: (error) => {
        console.error('Erreur de connexion', error);
      }
    });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: [null,[Validators.required]],

      password: [null,[Validators.required]],

      remember: [true]}
    ); //case coché par defaut
  }
 
  submitForm() {
    this.login.loginUser(this.loginForm.value).subscribe(res=>{
      console.log(res);
    },
      
      
      errors=>{
        this.message.error("Login ou mot de passe incorrect"), { nzDuration : 2000 };

    })

}
}