import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, tap, throwError } from 'rxjs';
import { ComponentDTO } from 'src/app/domain/dto/components.dto';
import { PageResponseDTO } from 'src/app/domain/dto/response/page-response.dto';
import { ComponentsService } from 'src/app/services/configuration/components.service';
import { ComponentsEditComponent } from './components-edit/components-edit.component';
import { ConfirmationDialogComponent } from 'src/app/components/dialog/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-components-page',
  templateUrl: './components-page.component.html',
  styleUrls: ['./components-page.component.css']
})
export class ComponentsPageComponent implements OnInit {

  pageObjects: PageResponseDTO<ComponentDTO> = new PageResponseDTO();

  objectDataSource: MatTableDataSource<ComponentDTO> = new MatTableDataSource();
  objectTableColumns: string[] = ['id', 'name', 'description', 'author', 'createdAt', "actions"];

  constructor(
    public dialog: MatDialog,
    public deleteDialog: MatDialog,
    private _service: ComponentsService,
    private _formBuilder: FormBuilder) { }

  searchForm = this._formBuilder.group({
    filterValue: ['']
  })
  filterControl = this.searchForm.get('filterValue');

  ngOnInit(): void {
    this.loadContent('');

    if (this.filterControl) {
      this.filterControl.valueChanges.pipe(
        debounceTime(300), // Atraso de 300 ms após a última alteração
        distinctUntilChanged() // Filtra apenas valores distintos consecutivos
      ).subscribe(filterValue => {
        this.loadContent(filterValue);
      });
    }
  }

  loadContent(filter: any) {
    this._service.getAll(filter, this.pageObjects.page, this.pageObjects.size).subscribe(response => {
      this.pageObjects = response;
      this.objectDataSource.data = this.pageObjects.content;
    })
  }

  handlePageEvent(e: PageEvent) {
    this.pageObjects.totalElements = e.length;
    this.pageObjects.size = e.pageSize;
    this.pageObjects.page = e.pageIndex;
    this.loadContent(this.filterControl?.value);
  }

  newObject() {
    const dialogRef = this.dialog.open(ComponentsEditComponent, {
      width: '800px',
      data: new ComponentDTO(),
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadContent(this.filterControl?.value);
    });
  }

  editObject(object: ComponentDTO) {
    this._service.getById(object.id).subscribe(resp => {
      object = resp;

      const dialogRef = this.dialog.open(ComponentsEditComponent, {
        width: '800px',
        data: object,
      });

      dialogRef.afterClosed().subscribe(result => {
        this.loadContent(this.filterControl?.value);
      });
    });
  }

  deleteObject(object: ComponentDTO) {
    const dialogRef = this.deleteDialog.open(ConfirmationDialogComponent, {
      width: '270px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._service.delete(object.id).pipe(
          tap(resp => {
            this.loadContent(this.filterControl?.value);
          }),
          catchError(error => {
            console.error(error);
            return throwError(error);
          })
        ).subscribe();
      }
    });
  }

}
