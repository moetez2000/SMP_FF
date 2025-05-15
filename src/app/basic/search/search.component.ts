import { Component } from '@angular/core';
import{ SearchService } from '../../services/search.service';
import { PetService } from '../../services/pet.service';

import { CommonModule } from '@angular/common';
import { FormsModule, NgForm,ReactiveFormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Subject } from 'rxjs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { PetownerService } from '../../services/petowner.service';
import { NzSelectModule } from 'ng-zorro-antd/select'; // Module pour nz-select
import { NzCardModule } from 'ng-zorro-antd/card';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';



@Component({

  standalone: true,
  imports: [CommonModule, FormsModule , NzModalModule ,
    CommonModule , 
    FormsModule,
    NzModalModule,
    NzFormModule, 
    NzIconModule,
    NzInputModule,  
      ReactiveFormsModule,
      NzButtonModule,
    NzRadioModule,NzModalModule,
    NzSelectModule,
    NzCardModule,
    
  ],
  providers: [SearchService, DatePipe],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  Searchs: any[] = [];
  petOwners: any[] = [];
  selectedPetId: number | null = null;
  selectedOwnerId: number | null = null;
  Pets : any[] = [];


  showForm = false;

formData = {
  user_id: '',
  pet_id: '',
  adresse: '',
  description: '',
  care_type: '',
  care_duration: '',
  start_date: '',
  end_date: '',
  expected_services: '',
  remunerationMin: null,
  remunerationMax: null,
  latitude: '',
  longitude: ''};

    map: any;
    marker: any;
  showMap: boolean = false;
  isModalVisible = false;
   isEditMode = false;

   searchSubject = new Subject<string>();
  
  searchTerm = '';
   showAddForm = false;
   newSearch={
    id: null,
    user_id: '',
    pet_id: '',
    adresse: '',
    description: '',
    care_type: '',
    care_duration: '',
    start_date: '',
    end_date: '',
    expected_services: '',
    remunerationMin: null,
    remunerationMax: null,
    latitude: '',
    longitude: ''
   }


   

  // Définir la liste des champs pour simplifier la gestion des données
 

  constructor(  private searchService:SearchService ,
     private message: NzMessageService,
                private modal: NzModalService,
                private datePipe: DatePipe,
                private PetownerService:PetownerService,
                private petService: PetService ,
  ) { }

  ngOnInit(){
    this.loadPetOwners();
    this.searchSubject.pipe(
  debounceTime(500),
  distinctUntilChanged(),
  switchMap(term => {
    return term ? this.searchService.getByOwnerOrStartDate(term) : this.searchService.getSearchs();
  })
).subscribe({
  next: (data) => {
    this.Searchs = data;
  },
  error: (err) => {
    console.error(err);
    this.Searchs = [];
  }
});

  
    
    // Corriger le problème d’icônes manquantes de Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    });
    this.loadSearchs();
     

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
toggleForm() {
  this.showForm = !this.showForm;
}

 onFilterInput(): void {
    this.searchSubject.next(this.searchTerm.trim());
  } 


onEditSearch(search: any): void {
    console.log('Search sélectionné pour modification :', search); // ← Ajout du log

  this.newSearch = { ...search };
  this.isEditMode = true;
  this.showAddForm = true;
}


onSubmitSearch(form: NgForm): void {
  if (form.invalid) return;

  if (this.isEditMode && this.newSearch.id !== null) {
    

   this.searchService.updateSearch(this.newSearch.id, this.newSearch).subscribe({
      next: () => {
        this.message.success('Recherche modifié avec succès');
        this.resetForm();
        this.loadSearchs();
      },
      error: (err) => {
        this.message.error('Erreur lors de la modification');
        console.error(err);
      }
    });
  }else {
    this.searchService.addSearch(this.newSearch).subscribe({
      next: () => {
        this.message.success('Recherche ajoutée avec succès');
        this.resetForm();
        this.loadSearchs();
      },
      error: (err) => {
        this.message.error("Erreur lors de l'ajout");
        console.error(err);
      }
    });
  }
}
resetForm(): void {
  this.newSearch={
    id: null,
    user_id: '',
    pet_id: '',
    adresse: '',
    description: '',
    care_type: '',
    care_duration: '',
    start_date: '',
    end_date: '',
    expected_services: '',
    remunerationMin: null,
    remunerationMax: null,
    latitude: '',
    longitude: ''
   };
  this.isEditMode = false;
  this.showAddForm = false;
}



onOwnerChange(ownerId: number): void {
  
  this.searchService.getPetsByOwner(ownerId).subscribe((pets) => {
    console.log('Réponse des pets:', pets); // Pour déboguer et voir ce que tu reçois
    this.Pets = pets;
  });
}
openAddModal(): void {
  this.resetForm(); // remet à zéro si on ajoute
  this.isEditMode = false;
  this.isModalVisible = true;
}





openMap() {
  this.showMap = true;

  setTimeout(() => {
    if (!this.map) {
      this.map = L.map('map').setView([36.8065, 10.1815], 7); // Vue sur la Tunisie
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('click', (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        this.formData.latitude = lat;
        this.formData.longitude = lng;

        L.marker([lat, lng]).addTo(this.map)
          .bindPopup('Position sélectionnée')
          .openPopup();

        // Appeler la fonction pour récupérer l'adresse
        this.getAddressFromCoordinates(lat, lng);
      });
    } else {
      this.map.invalidateSize(true); // Forcer le redimensionnement
    }
  }, 300);
}
openAddSearch(): void {
  this.resetForm();
  this.isEditMode = false;
  this.showAddForm = true;
}



resetMarker() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
      this.formData.latitude = '';
      this.formData.longitude = '';
    }
  }


closeMap() {
  this.showMap = false;
}
getAddressFromCoordinates(lat: number, lng: number): void {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&language=fr`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.address) {
        // Remplir le champ adresse avec les informations renvoyées par l'API
        this.formData.adresse = data.address.road ? `${data.address.road}, ${data.address.city}, ${data.address.country}` : "Adresse non trouvée";
      } else {
        this.formData.adresse = "Adresse non trouvée";
      }
    })
    .catch(error => {
      console.error('Erreur lors de la récupération de l\'adresse :', error);
      this.formData.adresse = "Erreur de géocodage";
    });
}
ondeleteSearch(searchId: number): void {
  this.modal.confirm({
    nzTitle: 'Êtes-vous sûr de vouloir supprimer cette recherche ?',
    nzContent: '<b style="color: red;">Cette action est irréversible !</b>',
    nzOkText: 'Oui',
    nzOnOk: () => {
      this.searchService.deleteSearch(searchId).subscribe({
        next: () => {
          this.message.success('Recherche supprimée avec succès');
          this.loadSearchs();
        },
        error: (err) => {
          this.message.error('Erreur lors de la suppression');
          console.error(err);
        }
      });
    },
    nzCancelText: 'Non'
  });

}

viewSearch(searchId:number): void {
  this.searchService.getSearchById(searchId).subscribe({
   next: (response) => {
      const search = response.search;
      const createdAt = response.created_at;
      const updatedAt = response.updated_at;

        if (search) {
        this.modal.create({
          nzTitle: 'Détails du Recherche',
          nzContent: `
            <div class="custom-modal-content">
              <p><strong>description :</strong> ${search.description} </p>
              <p><strong>Type_garde :</strong> ${search.care_type}</p>
              <p><strong>Services Attendus :</strong> ${search.expected_services}</p>
              <p><strong>Créé le :</strong> ${createdAt}</p>
              <p><strong>Mis à jour le :</strong> ${updatedAt}</p>
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
          nzContent: 'Recherche non trouvé.',
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
      

      
    





















      
      
