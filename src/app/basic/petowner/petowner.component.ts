import { Component, TemplateRef } from '@angular/core';
import { PetownerService } from '../../services/petowner.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';

interface PetOwner {
  id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  status: string;
}

@Component({
  standalone: true,
  selector: 'app-petowner',
  imports: [CommonModule , 
    FormsModule,
    NzModalModule,
    NzFormModule, 
    NzIconModule,
    NzInputModule,  
      ReactiveFormsModule,
      NzButtonModule,
      NzCardModule,
      

  ],
  templateUrl: './petowner.component.html',
  styleUrl: './petowner.component.css'
})
export class PetownerComponent {
  petOwners : any[] = [];
  statutOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Pending', label: ' Pending' },
    { value: 'Deleted', label: 'Deleted' },
    { value: 'Blocked', label: 'Blocked' },
    { value: 'Suspended', label: 'Suspended' }
   ];
   selectedStatus: string | null = null;  // lié au nz-select

   isModalVisible = false;
   isEditMode = false;
   showAddForm = false;
  newPetOwner = {
      id: null,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
      status: 'Active'};
  searchSubject = new Subject<string>();
  
  searchTerm = '';
  isDeletedStatus = false; // Pour savoir si on affiche les admins supprimés
suffixIconSearch: string|TemplateRef<void>|undefined;



  constructor( private PetownerService : PetownerService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) { }

  ngOnInit(): void {

    this.loadPetOwners();

    this.searchSubject.pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap(term => {
             return term ? this.PetownerService.getByEmailOrName(term) : this.PetownerService.getPetOwners();
          })
        ).subscribe({
          next: (data) => {
            console.log('Résultat de la recherche :', data);
        
            // 1) Si service renvoie directement un tableau
            if (Array.isArray(data)) {
              this.petOwners = data;
        
            // 2) Si service renvoie { data: [...] }
            } else if (Array.isArray((data as any).data)) {
              this.petOwners = (data as any).data;
        
            // 3) Cas unique : un seul objet
            } else {
              this.petOwners = [data];
            }
        
           
          },
          error: (err) => {
            console.error(err);
            this.petOwners = [];
           
          }
        });

  }

loadPetOwners():void {
    this.PetownerService.getPetOwners().subscribe({
      next: (data) => {
        console.log('Données reçues:', data);
        this.petOwners = Array.isArray(data) ? data : [];
  },
  error: (err) => {
    console.error('Erreur de récupération des données:', err);
    this.petOwners = []; // Réinitialiser les données
    
  }
});
 }
 onSearchInput(): void {
  this.searchSubject.next(this.searchTerm.trim());
}

resetSearch(): void {
  this.searchTerm = '';
  this.loadPetOwners(); // Réutilise la méthode existante
}
onStatusFilter(status:string):void{
  this.PetownerService.getByStatus(status).subscribe({
    next: data => {
      console.log('Résultat filtre statut :', data);
      if (Array.isArray(data)) {
        this.petOwners = data;
  
      // 2) Si service renvoie { data: [...] }
      } 
      this.isDeletedStatus = (status === 'Deleted');
      
    },
    error: err => {
      console.error(err);
      this.petOwners = [];
     
    }
  });
}
restoreOwner(petOwnerId: number): void {
  this.modal.confirm({
    nzTitle: 'Voulez-vous vraiment restaurer ce propriétaire d\'animal ?',
    nzOnOk: () => {
      this.PetownerService.restoreOwner(petOwnerId).subscribe({
        next: () => {
          this.message.success('Propriétaire d\'animal restauré avec succès');
          this.loadPetOwners();
        },
        error: (err) => {
          this.message.error('Erreur lors de la restauration');
          console.error(err);
        }
      });
    }
  });
}
forceDeleteOwner(petOwnerId: number): void {
  this.modal.confirm({
    nzTitle: 'Voulez-vous vraiment supprimer définitivement ce propriétaire d\'animal ?',
    nzOnOk: () => {
      this.PetownerService.forceDelete(petOwnerId).subscribe({
        next: () => {
          this.message.success('Propriétaire d\'animal supprimé définitivement avec succès');
          this.loadPetOwners();
        },
        error: (err) => {
          this.message.error('Erreur lors de la suppression définitive');
          console.error(err);
        }
      });
    }
  });
}

updatePetOwnerStatut(petOwnerId: number, newStatus: string): void {
  // Accéder à la liste des petOwners [petOwners, msg, success]
  const petOwner = this.petOwners[0].petOwners.find((p: { id: number; }) => p.id === petOwnerId);

  const oldStatus = petOwner.status;
  petOwner.status = newStatus;

  this.PetownerService.updateStatut(petOwnerId, newStatus).subscribe({
      next: (response) => {
          console.log('Mise à jour réussie', response);
      },
      error: (err) => {
          console.error('Erreur de mise à jour:', err);
          petOwner.status = oldStatus;
      },
      complete: () => {
          console.log('Mise à jour terminée');
      }
  });
}

onEditPetOwner(petOwner: any): void {
  this.newPetOwner = { ...petOwner };
  this.isEditMode = true;
  this.showAddForm = true;
}
onSubmitPetOwner(form: NgForm): void {
  if (form.invalid) return;

  if (this.isEditMode && this.newPetOwner.id !== null) {
    this.PetownerService.updatePetOwner(this.newPetOwner.id, this.newPetOwner).subscribe({
      next: () => {
        this.message.success('Propriétaire d\'animal modifié avec succès');
        this.resetForm();
        this.loadPetOwners();
      },
      error: (err) => {
        this.message.error('Erreur lors de la modification');
        console.error(err);
      }
    });
  } else {
    this.PetownerService.addPetOwner(this.newPetOwner).subscribe({
      next: () => {
        this.message.success('Propriétaire d\'animal ajouté avec succès');
        this.resetForm();
        this.loadPetOwners();
      },
      error: (err) => {
        this.message.error("Erreur lors de l'ajout");
        console.error(err);
      }
    });
  }
}
resetForm(): void {
  this.newPetOwner = {
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    status: 'Active'};
  this.isEditMode = false;
  this.showAddForm = false;
}


openAddModal(): void {
  this.resetForm(); // remet à zéro si on ajoute
  this.isEditMode = false;
  this.isModalVisible = true;
}

handleCancelModal(): void {
  this.isModalVisible = false;
}

ondeletePetOwner(petOwnerId: number): void {
  this.modal.confirm({
    nzTitle: 'Voulez-vous vraiment supprimer ce propriétaire d\'animal?',
    nzOnOk: () => {
      this.PetownerService.deletePetOwner(petOwnerId).subscribe({
        next: () => {
          this.message.success('Propriétaire d\'animal supprimé avec succès');
          this.loadPetOwners();
        },
        error: (err) => {
          this.message.error('Erreur lors de la suppression');
          console.error(err);
        }
      });
    }
  });
}
viewPetOwner(petOwnerId: number): void {
  this.PetownerService.getPetOwnerById(petOwnerId).subscribe({
    next: (response) => {
      const petOwner = response.petOwner;
      const createdAt = response.created_at;
      const updatedAt = response.updated_at;
      const deletedAt = response.deleted_at ?? 'Non supprimé';

      if (petOwner) {
        this.modal.create({
          nzTitle: 'Détails du Propriétaire',
          nzContent: `
            <div class="custom-modal-content">
              <p><strong>Nom :</strong> ${petOwner.first_name} ${petOwner.last_name}</p>
              <p><strong>Email :</strong> ${petOwner.email}</p>
              <p><strong>Statut :</strong> ${petOwner.status}</p>
              <p><strong>Créé le :</strong> ${createdAt}</p>
              <p><strong>Mis à jour le :</strong> ${updatedAt}</p>
              <p><strong>Supprimé le :</strong> ${deletedAt}</p>
            </div>
          `,
          nzClosable: true,
          
          nzFooter: null,
          nzWidth: '600px',
          nzStyle: { top: '20px' },
          nzBodyStyle: { padding: '20px', background: '#fff' }, // <-- Force un fond blanc
          nzMaskStyle: { background: 'rgba(0, 0, 0, 0.5)' } // <-- Assure un overlay semi-transparent
        });
      } else {
        this.modal.error({
          nzTitle: 'Erreur',
          nzContent: 'Propriétaire non trouvé.',
          nzMaskClosable: false
        });
      }
    },
    error: (err) => {
      console.error('Erreur :', err);
      this.modal.error({
        nzTitle: 'Erreur serveur',
        nzContent: 'Impossible de charger les données.',
        nzMaskClosable: false
      });
    }
  });
}



      

      
    



















}
