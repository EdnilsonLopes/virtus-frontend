import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, tap, throwError } from 'rxjs';
import { CycleDTO } from 'src/app/domain/dto/cycle.dto';
import { PageResponseDTO } from 'src/app/domain/dto/response/page-response.dto';
import { CyclesService } from 'src/app/services/configuration/cycles.service';
import { CyclesEditComponent } from './cycles-edit/cycles-edit.component';
import { ConfirmationDialogComponent } from 'src/app/components/dialog/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-cycles-page',
  templateUrl: './cycles-page.component.html',
  styleUrls: ['./cycles-page.component.css']
})
export class CyclesPageComponent implements OnInit {

  pageObjects: PageResponseDTO<CycleDTO> = new PageResponseDTO();

  objectDataSource: MatTableDataSource<CycleDTO> = new MatTableDataSource();
  objectTableColumns: string[] = ['id', 'name', 'author', 'createdAt', "actions"];

  constructor(
    public dialog: MatDialog,
    public deleteDialog: MatDialog,
    private _service: CyclesService,
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
    const dialogRef = this.dialog.open(CyclesEditComponent, {
      width: '800px',
      data: new CycleDTO(),
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadContent(this.filterControl?.value);
    });
  }

  editObject(object: CycleDTO) {
    this._service.getById(object.id).subscribe(resp => {
      object = resp;

      const dialogRef = this.dialog.open(CyclesEditComponent, {
        width: '800px',
        data: object,
      });

      dialogRef.afterClosed().subscribe(result => {
        this.loadContent(this.filterControl?.value);
      });
    });
  }

  deleteObject(object: CycleDTO) {
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
