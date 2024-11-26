import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { SignupComponent } from './features/signup/signup.component';
import { UserInforComponent } from './features/user/user-infor/user-infor.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { WarehouseComponent } from './features/admin/warehouse/warehouse.component';
import { UserComponent } from './features/admin/user/user.component';
import { UserShipmentComponent } from './features/user/user-shipment/user-shipment.component';

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
      }
      ,
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
            ]
      }

];
