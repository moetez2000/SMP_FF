import { Component } from '@angular/core';
import { PostulationService } from '../../services/postulation.service';
import { PetsitterService } from '../../services/petsitter.service';

import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import{ SearchService } from '../../services/search.service';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  standalone: true,
  selector: 'app-postulation',
  imports: [CommonModule , 
    FormsModule,
    NzModalModule,
    NzFormModule, 
    NzIconModule,
    NzInputModule,  
      ReactiveFormsModule,
      NzButtonModule,
    NzRadioModule,NzModalModule,
  NzCardModule],
  templateUrl: './postulation.component.html',
  styleUrl: './postulation.component.css'
})
export class PostulationComponent {
  Postulations:any[] = [];
  petSitters: any[] = [];
  Searchs: any[] = [];


   isModalVisible = false;
   showAddForm = false;
 form: FormGroup | undefined;
  newPostulation = {
  pet_sitter_ids: [] as number[],
  search_id: '',
  statut: 'en_attente'
};
existingPostulations: { [searchId: number]: number[] } = {};
StatutOptions = [
  { label: 'En attente', value: 'en_attente' },
  { label: 'Acceptée', value: 'acceptée' }, 
  { label: 'Validée', value: 'validée' },
  { label: 'En cours', value: 'en_cours' },
  { label: 'Terminée', value: 'terminée' },
  { label: 'Annulée', value: 'annulée' },
];
searchSubject = new Subject<string>();
  
searchTerm = '';


  constructor( private postulationService: PostulationService ,
          private message: NzMessageService,
              private modal: NzModalService,
           private   petsitterService: PetsitterService,
               private searchService:SearchService
              
          
    ) { } 


      ngOnInit(): void {
        this.loadPostulations();
        this.loadPetSitters();
        this.loadSearchs();
       this.searchSubject.pipe(
  debounceTime(500),
  distinctUntilChanged(),
  switchMap(term => term ? this.postulationService.searchByOwnerOrSitter(term) : this.postulationService.getPostulations())
).subscribe({
  next: (data) => {
    console.log(`Nombre de postulations reçues dans le composant : ${data.length}`);
    this.Postulations = data;
  },
  error: (err) => {
    console.error(err);
    this.Postulations = [];
  }
});

      
      }


   loadPostulations() {
  this.postulationService.getPostulations().subscribe(
    (response) => {
      this.Postulations = response;

      // Construire un dictionnaire { searchId: [sitterIds...] }
      this.existingPostulations = {};
      for (let post of response) {
        if (!this.existingPostulations[post.search_id]) {
          this.existingPostulations[post.search_id] = [];
        }
        this.existingPostulations[post.search_id].push(post.sitter_id);
      }
    },
    (error) => {
      console.error('Erreur postulations:', error);
    }
  );
}

  loadPetSitters() {
    this.petsitterService.getPetsitters().subscribe({
      next: (data) => {
        console.log('Données reçues:', data);
        this.petSitters = Array.isArray(data) ? data : [];
  },
  error: (err) => {
    console.error('Erreur de récupération des données:', err);
    this.petSitters = []; // Réinitialiser les données
    
  }
});
      
  }
   loadSearchs() {

     this.searchService.getSearchs().subscribe({
      next: (data) => {
        console.log(data);
        this.Searchs = data; // On affecte directement les données à `this.Pets`
      },
      error: (err) => {
        console.error(err);
        this.Searchs = []; // En cas d'erreur, on affiche un tableau vide
      }
    });
    }
// ⚠️ À appeler à chaque case cochée/décochée
    onSitterCheckboxChange(id: number, event: Event): void {
  const input = event.target as HTMLInputElement;
  const checked = input.checked;

  if (checked) {
    if (!this.newPostulation.pet_sitter_ids.includes(id)) {
      this.newPostulation.pet_sitter_ids.push(id);
    }
  } else {
    this.newPostulation.pet_sitter_ids = this.newPostulation.pet_sitter_ids.filter(sid => sid !== id);
  }
}



onSubmitPostulation(form: NgForm): void {
  if (form.invalid || this.newPostulation.pet_sitter_ids.length === 0) {
    this.message.warning("Veuillez remplir tous les champs et sélectionner au moins un gardien.");
    return;
  }

  this.postulationService.addPostulation(this.newPostulation).subscribe({
    next: () => {
      this.message.success("Postulation(s) ajoutée(s) avec succès.");
      this.showAddForm = false;
      form.resetForm();
      this. newPostulation = {
          pet_sitter_ids: [] as number[],
          search_id: '',
          statut: 'en_attente'
        };
      this.loadPostulations(); // à adapter
    },
    error: () => this.message.error("Erreur lors de l'ajout.")
  });
}
resetForm(): void {
  this.newPostulation = {
    pet_sitter_ids: [],
    search_id: '',
    statut: 'en_attente'
  };
  this.showAddForm = false;
}

openAddModal(): void {
  this.resetForm(); // remet à zéro si on ajoute
  this.isModalVisible = true;
}
hasAlreadyPostulated(sitterId: number): boolean {
  const searchId = parseInt(this.newPostulation.search_id || '0', 10); // ✅ conversion sûre
  return (
    this.existingPostulations[searchId] &&
    this.existingPostulations[searchId].includes(sitterId)
  );
}
updateStatut(postulationId: number, statut: string): void {
  const postulation = this.Postulations.find(p => p.id === postulationId);
  const oldStatut = postulation.statut;
  postulation.statut = statut;

  this.postulationService.updateStatut(postulationId, statut).subscribe({
    next: () => {
      this.message.success("Statut mis à jour avec succès.");
      this.loadPostulations();
    },
    error: () => this.message.error("Erreur lors de la mise à jour du statut.")
  });
}
onFilterInput(): void {
    this.searchSubject.next(this.searchTerm.trim());
  } 


  



    
}
