import { Component, OnInit } from '@angular/core';
import { PeticionesBackendService } from '../services/peticiones-backend.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-checkout',
  templateUrl: './user-checkout.component.html',
  styleUrls: ['./user-checkout.component.css'],
})
export class UserCheckoutComponent implements OnInit {
  //  User data
  jsonUserData: any;
  // Data from userHome (delivery point, organization)
  deliveryPointInfo: string;
  organizationId: string;
  organizationName: string;
  // Sessionstorage data
  userName = JSON.parse(sessionStorage.getItem('user_name'));
  id = JSON.parse(sessionStorage.getItem('_id'));
  // Table
  dtOptions: any;
  // baskets data
  basketsData: any[];
  // ngIf
  section: string;
  // Checkout  form
  formCheckout: FormGroup;
  // create order
  orderData: any;

  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private peticionesService: PeticionesBackendService
  ) {
    this.basketsData = [];
    // Checkout form
    this.formCheckout = new FormGroup({
      numberOfBasket: new FormControl(),
      picture: new FormControl(),
    });
    // create order
    this.orderData = {};
  }

  async ngOnInit(): Promise<any> {
    try {
      // DataTable options
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 5,
        lengthMenu: [5, 10, 25],
        processing: true,
        dom: 'Blfrtip',
        buttons: ['copy', 'csv', 'excel', 'print'],
      };
      // Get data from url
      this.activateRoute.params.subscribe((params) => {
        this.deliveryPointInfo = params.deliveryPoint;
        this.organizationId = params.idOrg;
        this.organizationName = params.orgName;
        // parmas.id o params.idorg
      });

      // Traer array de baskets
      const jsonBasketsDataByOrg = await this.peticionesService.getBasketsByOrganization(
        this.organizationId
      );
      this.basketsData = jsonBasketsDataByOrg.basketInfo;

      // traer info de user

      const jsonUserDataFromBBDD = await this.peticionesService.getOneUser(
        this.id
      );
      this.jsonUserData = jsonUserDataFromBBDD.UserInfo[0];
    } catch (error) {
      console.log('UserCheckoutComponent -> ngOnInit -> error', error);
    }
  }

  closeSession(): void {
    this.router.navigate(['/home']);
    sessionStorage.clear();
  }
  goBack(): void {
    this.router.navigate([`/userHome`, this.id]); // le paso el segundo parametro que es la id de la organizacion
  }
  loadSection($event): void {
    this.section = $event.target.dataset.section;
  }

  async checkout(): Promise<any> {
    try {
      // crear el objeto con toda la informacion para mandar por correo
      const checkoutData = this.formCheckout.value;
      // Crear la order

      this.orderData._id = this.id;
      this.orderData.organization = this.organizationId;
      this.orderData.basket = this.basketsData[
        checkoutData.numberOfBasket - 1
      ]._id;
      this.orderData.user = this.id;

      const jsonCreateORder = this.peticionesService.createOrder(
        this.orderData
      );
      // seguir con el objeto
      checkoutData.deliveryPoint = this.deliveryPointInfo;
      checkoutData.name = this.jsonUserData.name;
      checkoutData.surname1 = this.jsonUserData.surname1;
      checkoutData.surname2 = this.jsonUserData.surname2;
      checkoutData.email = this.jsonUserData.email;
      checkoutData.phone_number = this.jsonUserData.phone_number;
      checkoutData.basket = this.basketsData[checkoutData.numberOfBasket - 1];

      console.log('UserCheckoutComponent -> checkoutData', checkoutData);
      // console.log(
      //   'UserCheckoutComponent -> this.jsonUserData',
      //   this.basketsData[checkoutData.numberOfBasket - 1]._id
      // );

      this.formCheckout.reset();
      // this.router.navigate([`/userHome/${this.id}`]);
    } catch (error) {
      console.log('UserCheckoutComponent -> error', error);
    }
  }
}
