import { Component } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { PetownerService } from '../../services/petowner.service';

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
import { NzCardModule, NzCardTabComponent } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { DatePipe } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select'; // Module pour nz-select

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
    NzRadioModule,NzModalModule,
  NzCardModule,
NzTableModule ,
NzSelectModule],
providers: [PetService, DatePipe],
      
  templateUrl: './pet.component.html',
  styleUrl: './pet.component.css'
})
export class PetComponent {
  Pets : any[] = [];
  petOwners: any[] = [];
  selectedOwnerId: number | null = null;

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
    selectedMedia: File[] = [];


animalTypes: string[] = [
  'Chien',
  'Chat',
  'Lapin',
  'Oiseau',
  'Poisson',
  'Souris',
  'Tortue',
  'Autre'
];

animalBreeds: { [key: string]: string[] } = {
  'Chien': [
    'Labrador',
    'Berger Allemand',
    'Bulldog',
    'Golden Retriever',
    'Beagle',
    'Caniche',
    'Husky',
    'Shih Tzu'
  ],
  'Chat': [
    'Siamois',
    'Persan',
    'Maine Coon',
    'Bengal',
    'Sphynx',
    'Ragdoll'
  ],
  'Lapin': [
    'Holland Lop',
    'Netherland Dwarf',
    'Angora',
    'Rex'
  ],
  'Oiseau': [
    'Perruche',
    'Canari',
    'Calopsitte',
    'Perroquet'
  ],
  'Poisson': [
    'Poisson rouge',
    'Combattant',
    'Guppy',
    'Scalaire'
  ],
  'Souris': [
    'Rat',
    'Hamster',
    'Cochon d\'Inde',
    'Souris'
  ],
  'Tortue': [
    'Tortue d’Hermann',
    'Tortue grecque',
    'Tortue à oreilles rouges'
  ],
  'Autre': [
    'Furet',
    'Iguane',
    'Serpent',
    'Hérisson'
  ]
};

filteredBreeds: string[] = [];
onTypeChange(type: string) {
  this.filteredBreeds = this.animalBreeds[type] || [];
  this.newPet.breed = ''; // Réinitialiser la race
}
  



  constructor( private petService: PetService ,
        private message: NzMessageService,
            private modal: NzModalService,
             private PetownerService:PetownerService,
        
    
  ) { } 

  ngOnInit(): void {
    this.loadPets(); // charger les données des animaux
    this.loadPetOwners(); // charger owners (j en ai besoin dans le formulaire)
     this.searchSubject.pipe(
          debounceTime(1000),
          distinctUntilChanged(),
          switchMap(term => {
             return term ? this.petService.GetByTypeNameGender(term) : this.petService.getPets();
          })
        ).subscribe({
  next: (data) => {
    this.Pets = data; // plus besoin de vérifier tous les cas, car on s'assure que c'est un tableau
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
    this.Pets = data; // On affecte directement les données à `this.Pets`
  },
  error: (err) => {
    console.error(err);
    this.Pets = []; // En cas d'erreur, on affiche un tableau vide
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
 
  onMediaSelected(event: any): void {
  if (event.target.files) {
    this.selectedMedia = Array.from(event.target.files);
  }
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
    }else {
      this.newPet.is_vaccinated = !!this.newPet.is_vaccinated;
this.newPet.has_contagious_diseases = !!this.newPet.has_contagious_diseases;
this.newPet.has_medical_file = !!this.newPet.has_medical_file;
this.newPet.is_critical_condition = !!this.newPet.is_critical_condition;

   const formData = new FormData();

  formData.append('pet_owner_id', this.newPet.pet_owner_id);
  formData.append('name', this.newPet.name);
  formData.append('type', this.newPet.type);
  formData.append('breed', this.newPet.breed);
  formData.append('birth_date', this.newPet.birth_date);
  formData.append('weight', String(this.newPet.weight));
  formData.append('gender', this.newPet.gender);
  formData.append('color', this.newPet.color);
  formData.append('description', this.newPet.description || '');
  formData.append('is_vaccinated', this.newPet.is_vaccinated ? '1' : '0');
formData.append('has_contagious_diseases', this.newPet.has_contagious_diseases ? '1' : '0');
formData.append('has_medical_file', this.newPet.has_medical_file ? '1' : '0');
formData.append('is_critical_condition', this.newPet.is_critical_condition ? '1' : '0');


 for (let file of this.selectedMedia) {
    formData.append('media[]', file);
  }
  


  this.petService.addPet(formData).subscribe({
    next: () => {
      this.message.success('Animal ajouté avec succès');
      this.resetForm();
      this.loadPets();
    }
  });}}
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
              <p><strong>URL :</strong> <a href="${media.media_patth}" target="_blank">${media.media_patth}</a></p>
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
