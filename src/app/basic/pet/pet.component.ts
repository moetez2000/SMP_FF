import { Component } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-pet',
  imports: [CommonModule , 
    FormsModule,
    NzModalModule,
    NzFormModule, 
    NzIconModule,
    NzInputModule,  
      ReactiveFormsModule,
      NzButtonModule,
    NzRadioModule,NzModalModule],
      
  templateUrl: './pet.component.html',
  styleUrl: './pet.component.css'
})
export class PetComponent {
  Pets : any[] = [];
  newPet={
    id: null,
    pet_owner_id: '',
    name: '',
    type: '',
    birth_date: '',
    breed: '',
    gender: '',
    color: '',
    weight: null,
    description: '',
    is_vaccinated: false,
    has_contagious_diseases: false,
    has_medical_file: false,
    is_critical_condition: false,
    media: null,


  }
  mediaInput: string = '';

  isEditMode = false;
  showAddForm = false; 
  isModalVisible = false;
    searchSubject = new Subject<string>();
    searchTerm = '';

  



  constructor( private petService: PetService ,
        private message: NzMessageService,
            private modal: NzModalService,
        
    
  ) { } 

  ngOnInit(): void {
    this.loadPets(); // Appel de la méthode pour charger les données des animaux
     this.searchSubject.pipe(
              debounceTime(500),
              distinctUntilChanged(),
              switchMap(term => {
                 return term ? this.petService.GetByTypeNameGender(term) : this.petService.getPets();
              })
            ).subscribe({
              next: (data) => {
                console.log('Résultat de la recherche :', data);
            
                // 1) Si service renvoie directement un tableau
                if (Array.isArray(data)) {
                  this.Pets = data;
            
                // 2) Si service renvoie { data: [...] }
                } else if (Array.isArray((data as any).data)) {
                  this.Pets = (data as any).data;
            
                // 3) Cas unique : un seul objet
                } else {
                  this.Pets = [data];
                }
            
               
              },
              error: (err) => {
                console.error(err);
                this.Pets = [];
               
              }
            });
  }

  loadPets():void{
      this.petService.getPets().subscribe({
        next: (data) => {
          console.log('Données reçues:', data);
          this.Pets = Array.isArray(data) ? data : [];
    },
    error: (err) => {
      console.error('Erreur de récupération des données:', err);
      this.Pets = []; 
      
    }
  });
   }
   onEditPet(pet: any): void {
    this.newPet = { ...pet };
    this.isEditMode = true;
    this.showAddForm = true;
  }
  resetForm(): void {
    this.newPet = {
      id: null,
    pet_owner_id: '',
    name: '',
    type: '',
    birth_date: '',
    breed: '',
    gender: '',
    color: '',
    weight: null,
    description: '',
    is_vaccinated: false,
    has_contagious_diseases: false,
    has_medical_file: false,
    is_critical_condition: false,
    media: null,};

    this.isEditMode = false;
    this.showAddForm = false;
  }
  openAddModal(): void {
    this.isModalVisible = true;
    this.showAddForm = true;
    this.resetForm();
  }
  onSubmitPet(form: NgForm): void {
    if (form.invalid) return;
  
    if (this.isEditMode && this.newPet.id !== null) {
      this.petService.updatePet(this.newPet.id, this.newPet).subscribe({
        next: () => {
          this.message.success('animal modifié avec succès');
          this.resetForm();
          this.loadPets();
        },
        error: (err) => {
          this.message.error('Erreur lors de la modification');
          console.error(err);
        }
      });
    } else {
      this.petService.addPet( this.newPet).subscribe({
        next: () => {
          this.message.success('animal ajouté avec succès');
          this.resetForm();
          this.loadPets();
        },
        error: (err) => {
          this.message.error("Erreur lors de l'ajout");
          console.error(err);
        }
      });
    }
  }
  onDeletePet(petId:number):void{
    this.modal.confirm({
      nzTitle: 'Voulez-vous vraiment supprimer cet animal?',
      nzOnOk: () => {
        this.petService.deletePet(petId).subscribe({
          next: () => {
            this.message.success('animal supprimé avec succès');
            this.loadPets();
          },
          error: (err) => {
            this.message.error('Erreur lors de la suppression');
            console.error(err);
          }
        });
      }
    });
  }
  viewPet(petId: number): void {
    this.petService.getById(petId).subscribe({
      next: (response) => {
        const pet = response.pet;
        const createdAt = response.created_at;
        const updatedAt = response.updated_at;
  
        if (pet) {
          const mediasHtml = pet.medias?.map((media: any) => `
            <div style="margin-bottom: 8px;">
              <p><strong>Type :</strong> ${media.media_type}</p>
              <p><strong>URL :</strong> <a href="${media.media_url}" target="_blank">${media.media_url}</a></p>
              <p><strong>Miniature ?</strong> ${media.is_thumbnail ? 'Oui' : 'Non'}</p>
              <p><strong>Ajouté le :</strong> ${media.uploaded_at}</p>
            </div>
          `).join('') ?? '<p>Aucun média.</p>';
  
          this.modal.create({
            nzTitle: 'Détails de l\'animal',
            nzContent: `
              <div class="custom-modal-content">
                <p><strong>Nom :</strong> ${pet.name}</p>
                <p><strong>Type :</strong> ${pet.type}</p>
                <p><strong>Race :</strong> ${pet.breed}</p>
                <p><strong>Sexe :</strong> ${pet.gender}</p>
                <p><strong>Date de naissance :</strong> ${pet.birth_date}</p>
                <p><strong>Poids :</strong> ${pet.weight} kg</p>
                <p><strong>Couleur :</strong> ${pet.color}</p>
                <p><strong>Description :</strong> ${pet.description}</p>
                <p><strong>Vacciné :</strong> ${pet.is_vaccinated ? 'Oui' : 'Non'}</p>
                <p><strong>Maladie contagieuse :</strong> ${pet.has_contagious_diseases ? 'Oui' : 'Non'}</p>
                <p><strong>Dossier médical :</strong> ${pet.has_medical_file ? 'Oui' : 'Non'}</p>
                <p><strong>État critique :</strong> ${pet.is_critical_condition ? 'Oui' : 'Non'}</p>
                <p><strong>Créé le :</strong> ${createdAt}</p>
                <p><strong>Mis à jour le :</strong> ${updatedAt}</p>
                <hr />
                <h4>Médias</h4>
                ${mediasHtml}
              </div>
            `,
            nzClosable: true,
            nzFooter: null,
            nzWidth: '700px',
            nzStyle: { top: '20px' },
            nzBodyStyle: { padding: '20px', background: '#fff' },
            nzMaskStyle: { background: 'rgba(0, 0, 0, 0.5)' }
          });
        } else {
          this.modal.error({
            nzTitle: 'Erreur',
            nzContent: 'Animal non trouvé.',
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
  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm.trim());
  }
  
  resetSearch(): void {
    this.searchTerm = '';
    this.loadPets(); // Réutilise la méthode existante
  }
  
      
}
