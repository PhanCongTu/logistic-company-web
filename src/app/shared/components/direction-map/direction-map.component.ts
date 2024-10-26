import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AppConfig } from '../../../config';
import { Loader } from '@googlemaps/js-api-loader';
import { Coordinates } from '../../models/coordinates.model';

@Component({
  selector: 'app-direction-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direction-map.component.html',
  styleUrl: './direction-map.component.scss'
})
export class DirectionMapComponent {
  @Input() isVisible = false;
  @Output() dataEmitter = new EventEmitter<boolean>();
  @Output() waypointReached = new EventEmitter<number>(); // Phát sự kiện khi đến điểm dừng
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private origin: Coordinates = { lat: 10.762622, lng: 106.660172 }; // Điểm bắt đầu
  private destination: Coordinates = { lat: 21.028511, lng: 105.854444 }; // Điểm kết thúc
  private waypoints: { location: Coordinates; name: string }[] = [
    { location: { lat: 12.238791, lng: 109.196749 }, name: 'Điểm dừng A' }, // Điểm dừng A
    { location: { lat: 16.047079, lng: 108.206230 }, name: 'Điểm dừng B' }, // Điểm dừng B
  ];

  private currentPos: Coordinates = { lat: 16.047079, lng: 108.206230 }; // Vị trí hiện tại cố định

  map!: google.maps.Map;
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;
  polyline!: google.maps.Polyline; // Thêm polyline để đánh dấu đường đã đi
  infoWindow!: google.maps.InfoWindow; // Thêm InfoWindow để hiển thị thông tin

  constructor() {}

  async ngAfterViewInit() {
    const loader = new Loader({
      apiKey: AppConfig.ggMapAPIKey,
      version: 'weekly',
      libraries: ['places', 'marker'],
    });

    await loader.load();
    this.initMap();
  }

  async initMap(): Promise<void> {
    const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
    this.infoWindow = new google.maps.InfoWindow(); // Khởi tạo InfoWindow

    if (!this.mapContainer?.nativeElement) return;

    this.map = new Map(this.mapContainer.nativeElement, {
      center: this.origin,
      zoom: 6,
      mapId: '4504f8b37365c3d0',
      mapTypeControl: false,
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // Ẩn marker mặc định
      polylineOptions: {
        strokeColor: '#0341fc', // Màu đường
        strokeOpacity: 0.5, // Độ mờ của đường
        strokeWeight: 5, // Độ dày của đường
      }
    });
    this.directionsRenderer.setMap(this.map);

    this.calculateAndDisplayRoute();
  }

  calculateAndDisplayRoute() {
    const request: google.maps.DirectionsRequest = {
      origin: this.origin,
      destination: this.destination,
      waypoints: this.waypoints.map(wp => ({ location: wp.location })), // Chỉ truyền tọa độ đến request
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    this.directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        this.directionsRenderer.setDirections(result);
        
        // Thêm marker cho điểm bắt đầu
        this.addCustomMarker(this.origin, 'Điểm bắt đầu');
        
        // Thêm marker cho các điểm dừng
        this.waypoints.forEach(wp => {
          this.addCustomMarker(wp.location, wp.name); // Sử dụng tên từ mảng
        });

        // Thêm marker cho điểm kết thúc
        this.addCustomMarker(this.destination, 'Điểm kết thúc');

        // Đánh dấu đoạn đường đã đi đến điểm dừng A
        this.drawRouteToWaypoint(this.waypoints[0].location); // Dừng tại điểm A
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }

  // Thêm marker tùy chỉnh cho các điểm dừng
  addCustomMarker(location: Coordinates, title: string) {
    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: title,
    });

    // Thêm sự kiện click cho marker
    marker.addListener('click', () => {
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

  </style>
  
  <div id="infowindow-content" class="visible">
    <span id="place-displayname" class="title">${title}</span><br />
    <span id="place-address">abc</span>
  </div>
`;
      this.infoWindow.setContent(content); // Đặt nội dung cho InfoWindow
      this.infoWindow.open(this.map, marker); // Mở InfoWindow ở vị trí của marker
    });
  }

  // Đánh dấu đoạn đường đã đi đến điểm dừng cụ thể
  drawRouteToWaypoint(waypoint: Coordinates) {
    const path = [this.origin, waypoint]; // Tạo đường đi từ điểm bắt đầu đến điểm dừng A

    this.polyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 5,
    });

    this.polyline.setMap(this.map); // Vẽ polyline trên bản đồ
  }

  // Đóng bản đồ
  close() {
    this.dataEmitter.emit(false);
  }
}
