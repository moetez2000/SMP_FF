import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
//OnInit: pour exécuter une action au chargement.
import { FormGroup, FormsModule , FormBuilder,Validators, ReactiveFormsModule, NgForm} from '@angular/forms';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AdminManagmentService } from '../../services/admin-managment.service';
import { Router } from '@angular/router';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { animate, style, transition, trigger } from '@angular/animations';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MatSelectModule } from '@angular/material/select';
// Dans votre module
import { DropdownModule } from 'primeng/dropdown';

// Removed NzOptionModule as it is not exported by ng-zorro-antd/select

type AdminStatus = 'Active' | 'Inactive' | 'Suspended';

enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'

}

 interface Admin {
  id: number ;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;

  gender: Gender;
  phone: string;
  status: AdminStatus;
}

@Component({
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzModalModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzSpinModule,
    NzButtonModule,
    MatFormFieldModule,
    MatIconModule,
    NzIconModule ,
    NzInputModule,
    MatSelectModule ,
    MatFormFieldModule,
    DropdownModule
    

    
    
    ],
  templateUrl:'./admin-managment.component.html',
  styleUrls: ['./admin-managment.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, height: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, height: 0 }))
      ])
    ])
  ]
})
export class AdminManagmentComponent implements OnInit {
filteredAdmins() {
throw new Error('Method not implemented.');
}
  admins: any[] = [];
  statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Pending', label: ' Pending' },
    { value: 'Deleted', label: 'Deleted' },
    { value: 'Blocked', label: 'Blocked' }
  ];
  genderOptions = [
    { value: Gender.Male, label: 'Male' },
    { value: Gender.Female, label: 'Female' },
    { value: Gender.Other, label: 'Other' }
  ];
  adminForm!: FormGroup;
  isModalVisible = false;
  isEditMode = false;
  currentAdminId: number | null = null;
  newAdmin: Omit<Admin, 'id'> & { id: number | null } = {
    id: null, 
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',

    gender: Gender.Female,
    phone: '',
    status: 'Active',
    
  };
  errorMememssage: string = '';
  showAddForm = false;

  filters = {
    status: 'Active',
    first_name: '',
    last_name: '',
    searchQuery: ''  // Pour la recherche par téléphone et email
  };
  //isFilterActive = false;
  isFilterPanelVisible = false;
  filteredAdmin: any[] = [];
  deletedAdmins: any[] = [];
  deletedResults: any[] = [];

  searchTerm = '';
  searchSubject = new Subject<string>();
  isDeletedStatus = false; // Pour savoir si on affiche les admins supprimés
  selectedStatus: string | null = null;  // lié au nz-select
  statusFilters = [
    { value: 'Active', label: 'Actifs' },
    { value: 'Inactive', label: 'Inactifs' },
    { value: 'Pending', label: 'En attente' },
    { value: 'Blocked', label: 'Bloqués' },
    { value: 'Deleted', label: 'Supprimés' }
  ];
  



  constructor(private adminService: AdminManagmentService ,
    private modal: NzModalService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router

  ) {}

  ngOnInit(): void {
    this.loadAdmins();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term => {
        return term ? this.adminService.getByEmailOrPhone(term) : this.adminService.getAdmins();
      })
    ).subscribe({
      next: (data) => {
        console.log('Résultat de la recherche :', data);
        
        if (Array.isArray(data)) {
          // Cas de recherche → transformer en { admins: [...] }
          this.admins = [{ admins: data }];
        } else {
          // Cas initial (déjà { admins: [...] })
          this.admins = [data];
        }
      
       
      },
      error: (err) => {
        console.error(err);
        this.admins = [];
       
      }
    });
  }
  



  loadAdmins(): void {
    
    // Appeler le service avec ou sans filtres
    this.adminService.getAdmins().subscribe({
      next: (data) => {
        console.log('Données reçues:', data);
        this.admins = Array.isArray(data) ? data : [];
       
      },
      error: (err) => {
        console.error('Erreur de récupération des données:', err);
        this.admins = []; // Réinitialiser les données
        
      }
    });
  }
  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm.trim());
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.loadAdmins(); // Réutilise la méthode existante
  }
 // **Nouvelle méthode** : filtre par statut
 // Quand on clique sur un bouton de statut
onStatusFilter(status: string): void {
  this.adminService.getAdminsByStatus(status).subscribe({
    next: data => {
      console.log('Résultat filtre statut :', data);
      // Même wrapping que pour email/phone
      if (Array.isArray(data)) {
        this.admins = [{ admins: data }];
      } else {
        this.admins = [data];
      }
      this.isDeletedStatus = (status === 'Deleted');
    
    },
    error: err => {
      console.error(err);
      this.admins = [];
     
    }
  });
}

restoreAdmin(adminId: number): void {
  this.modal.confirm({
    nzTitle: 'Voulez-vous vraiment restaurer cet admin ?',
    nzOnOk: () => {
      this.adminService.restoreAdmin(adminId).subscribe({
        next: () => {
          this.message.success('Admin restauré avec succès');
          this.loadAdmins();
        },
        error: (err) => {
          this.message.error('Erreur lors de la restauration');
          console.error(err);
        }
      });
    }
  });
}


  
  

  viewAdmin(adminId: number): void {
    this.adminService.getAdminById(adminId).subscribe({
      next: (response) => {
        const admin = response.admin;
        const permissions = response.permissions;
        const createdAt = response.created_at;
        const updatedAt = response.updated_at;
        const deletedAt = response.deleted_at ?? 'Non supprimé';

        if (admin) {
          this.modal.info({
            nzTitle: 'Détails de l\'Administrateur',
            nzContent: `
              <p><strong>Name :</strong> ${admin.first_name} ${admin.last_name}</p>
              <p><strong>Email :</strong> ${admin.email}</p>
              <p><strong>Phone :</strong> ${admin.phone}</p>
              <p><strong>Gender :</strong> ${admin.gender}</p>
              <p><strong>Birth_Date :</strong> ${admin.birth_date}</p>
              <p><strong>Statut :</strong> ${admin.Status}</p>
              <p><strong>permissions :</strong> ${permissions.length ? permissions.join(', ') : 'Aucune'}</p>
              <p><strong>createdAt :</strong> ${createdAt}</p>
              <p><strong>updatedAt :</strong> ${updatedAt}</p>
              <p><strong>deletedAt :</strong> ${deletedAt}</p>


            `,
            nzOnOk: () => console.log('Popup fermé')
          });
        } else {
          this.modal.error({
            nzTitle: 'Erreur',
            nzContent: 'Administrateur non trouvé.'
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'admin :', err);
        this.modal.error({
          nzTitle: 'Erreur serveur',
          nzContent: 'Impossible de charger les données.'
        });
      }
    });
  }
  
  updateAdminStatus(adminId: number, newStatus: string): void {

    //acceder al vrai liste d'admins [admins,msg,success]
    const admin = this.admins[0].admins.find((a: { id: number; }) => a.id === adminId);


    const oldStatus = admin.status;
    admin.status = newStatus;

    this.adminService.updateStatus(adminId, newStatus).subscribe({
        next: (response) => {
            console.log('Update successful', response);
        },
        error: (err) => {
            console.error('Update error:', err);
            admin.status = oldStatus;
        },
        complete: () => {
            console.log('Update complete');
        }
    });
}
  onEditAdmin(admin: Admin): void {
    this.newAdmin = { ...admin };
    this.isEditMode = true;
    this.showAddForm = true;
  }

  onSubmitAdmin(form: NgForm): void {
    if (form.invalid) return;

    if (this.isEditMode && this.newAdmin.id !== null) {
      this.adminService.updateAdmin(this.newAdmin.id, this.newAdmin as Admin).subscribe({
        next: () => {
          this.message.success('Administrateur modifié avec succès');
          this.resetForm();
          this.loadAdmins();
        },
        error: (err) => {
          this.message.error('Erreur lors de la modification');
          console.error(err);
        }
      });
    } else {
      this.adminService.addAdmin(this.newAdmin).subscribe({
        next: () => {
          this.message.success('Administrateur ajouté avec succès');
          this.resetForm();
          this.loadAdmins();
        },
        error: (err) => {
          this.message.error("Erreur lors de l'ajout");
          console.error(err);
        }
      });
    }
  }

  resetForm(): void {
    this.newAdmin = {
      id: null,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',

      gender: Gender.Female,
      phone: '',
      status: 'Active'
    };
    this.isEditMode = false;
    this.showAddForm = false;
  }

  onDeleteAdmin(adminId: number): void {
    this.modal.confirm({
      nzTitle: 'vous-voulez vraiment supprimer cet administrateur?',
      nzOnOk: () => {
        this.adminService.deleteAdmin(adminId).subscribe({
          next: () => {
            this.message.success('Administrateur supprimé avec succès');
            this.loadAdmins();
          },
          error: (err) => {
            this.message.error('Erreur lors de la suppression');
            console.error(err);
          }
        });
      }
    });
  }
  forceDeleteAdmin(adminId: number): void {
    this.modal.confirm({
      nzTitle: 'Voulez-vous vraiment supprimer définitivement cet administrateur ?',
      nzContent: 'Cette action est irréversible.',
      nzOkText: 'Oui',
      nzCancelText: 'Annuler',
      nzOnOk: () => {
        this.adminService.forceDelete(adminId).subscribe({
          next: () => {
            this.message.success('Administrateur supprimé définitivement');
            this.onStatusFilter('Deleted');
          },
          error: (err) => {
            this.message.error('Erreur lors de la suppression');
            console.error(err);
          }
        });
      }
    });
  }
  
  /*loadDeletedAdmins(): void {
    this.initialized = false;
  
    this.adminService.getTrashedAdmins().subscribe({
      next: (data) => {
        console.log('Admins supprimés reçus:', data);
        this.admins = Array.isArray(data) ? data : [];
        this.accessDenied = false;
        this.isLoading = false;
        this.initialized = true;
      },
      error: (err) => {
        console.error('Erreur de récupération des admins supprimés:', err);
        this.accessDenied = true;
        this.admins = []; // Réinitialiser les données
        this.isLoading = false;
        this.initialized = true;
      }
    });
  }*/
  





    
    
}


