import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { AppConfig } from '../../../config';
import { Coordinates } from '../../models/coordinates.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {

  @Output() dataEmitter = new EventEmitter<Coordinates>();
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @ViewChild('placeAutocompleteInput', { static: false }) placeAutocompleteInput!: ElementRef;
  
  private defaultCoordinate: Coordinates = AppConfig.defaultCoordinate;
  private coordicate: Coordinates | null = null;

  map!: google.maps.Map;
  marker!: google.maps.marker.AdvancedMarkerElement;
  infoWindow!: google.maps.InfoWindow;

  constructor() {
  }

  sendData() {
    if (this.coordicate != null) {
      this.dataEmitter.emit(this.coordicate);
    }
  } 

  async ngAfterViewInit() {
    // Sử dụng `@googlemaps/js-api-loader` để tải Google Maps API
    const loader = new Loader({
      apiKey: AppConfig.ggMapAPIKey,
      version: 'weekly',
      libraries: ['places', 'marker'],
    });

    await loader.load();

    // Khởi tạo map
    this.initMap();
  }

  async initMap(): Promise<void> {
    const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

    // Tạo map
    this.map = new Map(this.mapContainer.nativeElement, {
      center: this.defaultCoordinate,
      zoom: 13,
      mapId: '4504f8b37365c3d0',
      mapTypeControl: false,
    });

    // Tạo autocomplete
    //@ts-ignore
    const placeAutocomplete = new google.maps.places.Autocomplete(this.placeAutocompleteInput.nativeElement);

    // Đặt marker mặc định
    this.marker = new AdvancedMarkerElement({
      map: this.map,
    });

    // Tạo InfoWindow để hiển thị thông tin
    this.infoWindow = new google.maps.InfoWindow();

    // Lắng nghe sự kiện chọn địa điểm từ Autocomplete
    placeAutocomplete.addListener('place_changed', async () => {
      const place = placeAutocomplete.getPlace();
      await this.handlePlaceSelect(place);
    });

    // Lắng nghe sự kiện click trên bản đồ
    this.map.addListener('click', (event: any) => {
      this.placeMarker(event.latLng);
      this.coordicate = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      }
    });
  }

  placeMarker(location: google.maps.LatLng) {
    // Cập nhật vị trí marker và hiển thị infoWindow
    this.marker.position = location;

    // Tạo nội dung cho infoWindow
    const content = `
      <style>
       #infowindow-content {
      background-color: #ffffff; /* Màu nền trắng */
      color: #333333; /* Màu chữ xám tối */
      padding: 0 1rem 1rem 1rem; /* Padding cho thẻ chú thích */
      border-radius: 0.5rem; /* Bo góc */
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); /* Bóng đổ mềm mại */
      width: 400px; /* Chiều rộng thẻ chú thích */
      position: relative; /* Để căn chỉnh dễ hơn nếu cần */
      opacity: 0; /* Bắt đầu ở trạng thái ẩn */
      transition: opacity 0.3s ease-in-out, transform 0.3s ease; /* Hiệu ứng chuyển động */
      transform: translateY(-10px); /* Đẩy thẻ chú thích lên một chút */
    }

    #infowindow-content.visible {
      opacity: 1; /* Hiện thị khi có lớp 'visible' */
      transform: translateY(0); /* Trở về vị trí ban đầu */
    }

    .title {
      font-size: 1.5rem; /* Kích thước chữ lớn hơn cho tên địa điểm */
      font-weight: bold; /* Độ đậm chữ cho tên địa điểm */
      margin-bottom: 0.5rem; /* Khoảng cách dưới tiêu đề */
      color: #007bff; /* Màu chữ xanh dương */
    }

    #place-address {
      font-size: 0.95rem; /* Kích thước chữ cho địa chỉ */
      line-height: 1.4; /* Tăng khoảng cách giữa các dòng */
      color: #555555; /* Màu chữ xám sáng cho địa chỉ */
      word-wrap: break-word; /* Đảm bảo địa chỉ không bị tràn ra ngoài */
    }

    #infowindow-content:hover {
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3); /* Bóng đổ sâu hơn khi hover */
      transform: scale(1.05); /* Phóng to một chút khi hover */
      cursor: pointer; /* Thay đổi con trỏ khi hover */
    }
      </style>
      
      <div id="infowindow-content" class="visible">
        <span id="place-displayname" class="title">Sellected position:</span><br />
        <span id="place-address">${location.lat()}, ${location.lng()}</span>
      </div>
    `;

    this.updateInfoWindow(content, location);
  }

  async handlePlaceSelect(place: google.maps.places.PlaceResult): Promise<void> {
    if (!place.geometry || !place.geometry.location) {
      return;
    }

    this.coordicate = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    }

    // Di chuyển map đến vị trí mới
    if (place.geometry.viewport) {
      this.map.fitBounds(place.geometry.viewport);
    } else {
      this.map.setCenter(place.geometry.location);
      this.map.setZoom(17);
    }

    // Tạo nội dung cho infoWindow
    const content = `
  <style>
    #infowindow-content {
      crollable: scroll
      background-color: #ffffff; /* Màu nền trắng */
      color: #333333; /* Màu chữ xám tối */
      padding: 0 1rem 1rem 1rem; /* Padding cho thẻ chú thích */
      border-radius: 0.5rem; /* Bo góc */
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); /* Bóng đổ mềm mại */
      width: 400px; /* Chiều rộng thẻ chú thích */
      position: relative; /* Để căn chỉnh dễ hơn nếu cần */
      opacity: 0; /* Bắt đầu ở trạng thái ẩn */
      transition: opacity 0.3s ease-in-out, transform 0.3s ease; /* Hiệu ứng chuyển động */
      transform: translateY(-10px); /* Đẩy thẻ chú thích lên một chút */
    }

    #infowindow-content.visible {
      opacity: 1; /* Hiện thị khi có lớp 'visible' */
      transform: translateY(0); /* Trở về vị trí ban đầu */
    }

    .title {
      font-size: 1.5rem; /* Kích thước chữ lớn hơn cho tên địa điểm */
      font-weight: bold; /* Độ đậm chữ cho tên địa điểm */
      margin-bottom: 0.5rem; /* Khoảng cách dưới tiêu đề */
      color: #007bff; /* Màu chữ xanh dương */
    }

    #place-address {
      font-size: 0.95rem; /* Kích thước chữ cho địa chỉ */
      line-height: 1.4; /* Tăng khoảng cách giữa các dòng */
      color: #555555; /* Màu chữ xám sáng cho địa chỉ */
      word-wrap: break-word; /* Đảm bảo địa chỉ không bị tràn ra ngoài */
    }

    #infowindow-content:hover {
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3); /* Bóng đổ sâu hơn khi hover */
      transform: scale(1.05); /* Phóng to một chút khi hover */
      cursor: pointer; /* Thay đổi con trỏ khi hover */
    }
  </style>
  
  <div id="infowindow-content" class="visible">
    <span id="place-displayname" class="title">${place.name}</span><br />
    <span id="place-address">${place.formatted_address}</span>
  </div>
`;


    this.updateInfoWindow(content, place.geometry.location);
    this.marker.position = place.geometry.location;
  }

  updateInfoWindow(content: string, location: google.maps.LatLng | google.maps.LatLngLiteral) {
    this.infoWindow.setContent(content);
    this.infoWindow.setPosition(location);
    this.infoWindow.open({
      map: this.map,
      anchor: this.marker,
      shouldFocus: false,
    });
  }
}
