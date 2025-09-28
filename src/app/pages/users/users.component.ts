import { Component, Input, OnInit } from '@angular/core';
import { TableCrudComponent } from '../../components/table-crud/table-crud.component';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { FormField } from '../../models/form-field.component';

/**
 * UsersComponent
 *
 * Componente de página para la gestión de usuarios.
 * Muestra una tabla CRUD reutilizable para usuarios y define los campos y funciones específicas.
 * Utiliza el servicio UserService para operaciones CRUD.
 */
@Component({
  selector: 'app-users',
  imports: [TableCrudComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  /**
   * Lista de usuarios cargados desde el backend.
   */
  users: User[] = [];
  /**
   * Encabezados de la tabla.
   */
  headTable:string[] = ['ID', 'Nombre', 'Email', 'Actualizar', 'Eliminar']
  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData:string[] = ['_id', 'name', 'email']
  /**
   * Diccionario de funciones CRUD para pasar al componente de tabla.
   */
  arrayFunctions: Record<string, Function>;
  /**
   * Definición de los campos del formulario para el modal CRUD.
   */
  fields: FormField[] = [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Ingrese el nombre', required: true, min: 3, max: 50 },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Ingrese el email', required: true, pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
    { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Ingresa la contraseña', required: true, min: 8, max: 15, pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\[\\]{};:,.<>?\\\\|`~\\-=\\/]).{8,15}$' },
  ];

  /**
   * Constructor: inicializa el servicio y el diccionario de funciones CRUD.
   * @param userService Servicio de usuarios para operaciones CRUD
   */
  constructor(private userService: UserService) {
    this.arrayFunctions = {
      update: (id?: string, user?: User) => this.update(id, user),
      create: (user?: User) => this.create(user),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Inicializa la carga de usuarios al iniciar el componente.
   */
  ngOnInit(): void { this.loadUsers() }

  /**
   * Carga la lista de usuarios desde el backend.
   */
  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  /**
   * Busca un usuario por su ID y lo muestra en consola.
   * @param id ID del usuario
   */
  findById(id: string): any {
    this.userService.getUserById(id).subscribe({
      next: (data) => console.log('Usuario encontrado:', data),
      error: (err) => console.error('Error al buscar usuario', err)
    });
  }

  /**
   * Actualiza un usuario existente.
   * @param id ID del usuario
   * @param user Datos actualizados del usuario
   */
  update(id?: string, user?: User): any {
    this.userService.updateUser(id, user).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Error al actualizar usuario', err)
    });
  }

  /**
   * Crea un nuevo usuario.
   * @param user Datos del nuevo usuario
   */
  create(user?: User): any {
    if (user) {
      this.userService.createUser(user).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error al crear usuario', err)
      });
    }
  }

  /**
   * Elimina un usuario por su ID.
   * @param id ID del usuario a eliminar
   */
  delete(id: string): any {
    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Error al eliminar usuario', err)
    });
  }
}
