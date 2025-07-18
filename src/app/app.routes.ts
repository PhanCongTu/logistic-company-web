import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { SignupComponent } from './features/signup/signup.component';
import { UserInforComponent } from './features/user/user-infor/user-infor.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { WarehouseComponent } from './features/admin/warehouse/warehouse.component';
import { UserComponent } from './features/admin/user/user.component';
import { UserShipmentComponent } from './features/user/user-shipment/user-shipment.component';
import { ManageShipmentComponent } from './features/warehouse-manager/manage-shipment/manage-shipment.component';
import { WarehouseInforComponent } from './features/admin/warehouse-infor/warehouse-infor.component';
import { DeliveryShippmentComponent } from './features/shipper/delivery-shippment/delivery-shippment.component';
import { TransportingShipmentComponent } from './features/transporter/transporting-shipment/transporting-shipment.component';
import { ShipmentInfoComponent } from './features/warehouse-manager/shipment-info/shipment-info.component';

export const ROUTES = {
      home: '',
      login: 'login',
      signup: 'signup',
      resetPassword: 'reset-password',
      user: {
            userInfo: 'user/infor',
            userShipment: 'user/my-shipments',
      },
      admin: {
            adminWarehouse: 'admin/warehouse',
            adminUser: 'adminuser',
            adminWarehouseInfo: 'admin/warehouse/:warehouseId',
      },
      warehouseManager: {
            manageShipment: 'manage-shipment',
            manageWarehouseInfo: 'manage-warehouse',
            shipmentInfo: 'shipment-info/:trackingNumber',
      },
      shipper: {
            deliveryShipment: 'shipper/delivery'
      },
      transporter: {
            transportingShipment: 'transporter/transporting'
      }
};

export const routes: Routes = [
      {
            path: ROUTES.home,
            component: HomeComponent
      },
      {
            path: ROUTES.login,
            component: LoginComponent
      },
      {
            path: ROUTES.signup,
            component: SignupComponent
      },
      {
            path: ROUTES.resetPassword,
            component: ResetPasswordComponent
      },
      {
            title: 'USER',
            path: '',
            children: [
                  {
                        path: ROUTES.user.userInfo,
                        component: UserInforComponent
                  },
                  {
                        path: ROUTES.user.userShipment,
                        component: UserShipmentComponent
                  },
            ]
      },
      {
            title: 'ADMIN',
            path: '',
            children: [
                  {
                        path: ROUTES.admin.adminWarehouse,
                        component: WarehouseComponent
                  },
                  {
                        path: ROUTES.admin.adminUser,
                        component: UserComponent
                  },
                  {
                        path: ROUTES.admin.adminWarehouseInfo,
                        component: WarehouseInforComponent
                  },
            ]
      },
      {
            title: 'WAREHOUSE_MANAGER',
            path: '',
            children: [
                  {
                        path: ROUTES.warehouseManager.manageShipment,
                        component: ManageShipmentComponent
                  },
                  {
                        path: ROUTES.warehouseManager.manageWarehouseInfo,
                        component: WarehouseInforComponent
                  },
                  {
                        path: ROUTES.warehouseManager.shipmentInfo,
                        component: ShipmentInfoComponent
                  }
            ]
      },
      {
            title: 'SHIPPER',
            path: '',
            children: [
                  {
                        path: ROUTES.shipper.deliveryShipment,
                        component: DeliveryShippmentComponent
                  }
            ]
      },
      {
            title: 'TRANSPORTER',
            path: '',
            children: [
                  {
                        path: ROUTES.transporter.transportingShipment,
                        component: TransportingShipmentComponent
                  }
            ]
      }

];
