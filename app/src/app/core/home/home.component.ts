import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BannerComponent } from "./banner/banner.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, BannerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class HomeComponent {

}
