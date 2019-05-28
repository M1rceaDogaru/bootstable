/*
Bootstable
 @description  Javascript library to make HMTL tables editable, using Bootstrap
 @version 1.2
 @autor Tito Hinostroza, Mircea Dogaru
*/
"use strict";
//Global variables    
  var bootstableConfigurations = {};
var newColHtml = '<div class="btn-group pull-right">'+
'<button id="bEdit" type="button" class="btn btn-sm btn-default"  onclick="rowEdit(this);">' +
'<i class="fas fa-pencil-alt"></i>'+
'</button>'+
'<button id="bElim" type="button" class="btn btn-sm btn-default"  onclick="rowElim(this);">' +
'<i class="fas fa-trash" aria-hidden="true"></i>'+
'</button>'+
'<button id="bAcep" type="button" class="btn btn-sm btn-default accept-button"  style="display:none;" onclick="rowAcep(this);">' + 
'<i class="fas fa-check"></i>'+
'</button>'+
'<button id="bCanc" type="button" class="btn btn-sm btn-default" style="display:none;"  onclick="rowCancel(this);">' + 
'<i class="fas fa-times" aria-hidden="true"></i>'+
'</button>'+
  '</div>';

   var saveColHtml = '<div class="btn-group pull-right">'+
'<button id="bEdit" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowEdit(this);">' +
'<i class="fas fa-pencil-alt"></i>'+
'</button>'+
'<button id="bElim" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowElim(this);">' +
'<i class="fas fa-trash" aria-hidden="true"></i>'+
'</button>'+
'<button id="bAcep" type="button" class="btn btn-sm btn-default accept-button"   onclick="rowAcep(this);">' + 
'<i class="fas fa-check"></i>'+
'</button>'+
'<button id="bCanc" type="button" class="btn btn-sm btn-default"  onclick="rowCancel(this);">' + 
'<i class="fas fa-times" aria-hidden="true"></i>'+
'</button>'+
  '</div>';
var colEdicHtml = '<td name="buttons">'+newColHtml+'</td>'; 
var colSaveHtml = '<td name="buttons">'+saveColHtml+'</td>';
  
$.fn.SetEditable = function (options) {
  var defaults = {
      columnsEd: null,         //Index to editable columns. If null all td editables. Ex.: "1,2,3,4,5"
      columnsConfig: null,     //Array of objects with index, input and value properties 
      $addButton: null,        //Jquery object of "Add" button
      onEdit: function() {},   //Called after edition
      onBeforeDelete: function() {}, //Called before deletion
      onDelete: function() {}, //Called after deletion
      onAdd: function() {}     //Called when added a new row
  };    
  this.find('thead tr').append('<th name="buttons"></th>');  //encabezado vacío
  this.find('tbody tr').append(colEdicHtml);
  var $tabedi = this;   //Read reference to the current table, to resolve "this" here.

  var tableId = $tabedi.attr('id');
  var params = $.extend(defaults, options);

  bootstableConfigurations[tableId] = {};
  bootstableConfigurations[tableId].params = params;

  //Process "addButton" parameter
  if (params.$addButton != null) {
      //Se proporcionó parámetro
      params.$addButton.click(function () {            
          var newRows = $tabedi.find('[new-row]');            

          if (newRows.length > 0) {
              return;
          }

          $tabedi.find('.accept-button').each(function () {
              this.click();
          });
          rowAddNew($tabedi.attr("id"));
      });
  }
  //Process "columnsEd" parameter
  if (params.columnsEd != null) {
      //Extract felds
      bootstableConfigurations[tableId].colsEdi = params.columnsEd.split(',');
  }
};
function IterarCamposEdit($cols, tarea, tableId) {
//Itera por los campos editables de una fila
  var n = 0;
  $cols.each(function() {
      n++;
      if ($(this).attr('name')=='buttons') return;  //excluye columna de botones
      if (!EsEditable(n-1)) return;   //noe s campo editable
      tarea($(this), n-1);
  });
  
  function EsEditable(idx) {
      var colsEdi = bootstableConfigurations[tableId].colsEdi;
  //Indica si la columna pasada está configurada para ser editable
      if (colsEdi==null) {  //no se definió
          return true;  //todas son editable
      } else {  //hay filtro de campos
//alert('verificando: ' + idx);
          for (var i = 0; i < colsEdi.length; i++) {
            if (idx == colsEdi[i]) return true;
          }
          return false;  //no se encontró
      }
  }
}
function FijModoNormal(but) {
  $(but).parent().find('#bAcep').hide();
  $(but).parent().find('#bCanc').hide();
  $(but).parent().find('#bEdit').show();
  $(but).parent().find('#bElim').show();
  var $row = $(but).parents('tr');  //accede a la fila
  $row.attr('id', '');  //quita marca
  $row.removeAttr('new-row');
}
function FijModoEdit(but) {

  $(but).parent().find('#bAcep').show();
  $(but).parent().find('#bCanc').show();
  $(but).parent().find('#bEdit').hide();
  $(but).parent().find('#bElim').hide();
  var $row = $(but).parents('tr');  //accede a la fila
  $row.attr('id', 'editing');  //indica que está en edición
}
function ModoEdicion($row) {
  if ($row.attr('id')=='editing') {
      return true;
  } else {
      return false;
  }
}
function rowAcep(but) {
  //Acepta los cambios de la edición        
  var $row = $(but).parents('tr');  //accede a la fila    
  var $cols = $row.find('td');  //lee campos
  if (!ModoEdicion($row)) return;  //Ya está en edición
  //Está en edición. Hay que finalizar la edición
  var tableId = $row.parents('table').attr('id');
  IterarCamposEdit($cols, function($td, index) {  //itera por la columnas
      var cont = null;
      var columnConfig = getColumnConfigByIndex(index, tableId);
      if (columnConfig) {
          cont = columnConfig.value();
      } else {
          cont = $td.find('input').val(); //lee contenido del input
      }
      
      $td.html(cont);  //fija contenido y elimina controles
  }, tableId);
  FijModoNormal(but);
  bootstableConfigurations[tableId].params.onEdit($row);
}
function getColumnConfigByIndex(index, tableId) {
  var params = bootstableConfigurations[tableId].params;
  if (params.columnsConfig == null) {
      return null;
  }

  var columnConfig = null;
  params.columnsConfig.some(function (config) {
      if (config.index == index) {
          columnConfig = config;
          return true;
      }

      return false;
  });

  return columnConfig;
}
function rowCancel(but) {
//Rechaza los cambios de la edición
  var $row = $(but).parents('tr');  //accede a la fila
  var $cols = $row.find('td');  //lee campos
  if (!ModoEdicion($row)) return;  //Ya está en edición
  //Está en edición. Hay que finalizar la edición
  var tableId = $row.parents('table').attr('id');
  IterarCamposEdit($cols, function($td) {  //itera por la columnas
      var cont = $td.find('div').html(); //lee contenido del div
      $td.html(cont);  //fija contenido y elimina controles
  }, tableId);
  FijModoNormal(but);
}
function rowEdit(but) {  
  var $td = $("tr[id='editing'] td");
  rowAcep($td);
  var $row = $(but).parents('tr');  
  var $cols = $row.find('td');  
  if (ModoEdicion($row)) return;  //Ya está en edición
  //Pone en modo de edición
  var tableId = $row.parents('table').attr('id');
  IterarCamposEdit($cols, switchToEdit, tableId);
  FijModoEdit(but);
}
function rowElim(but) {  //Elimina la fila actual
  var $row = $(but).parents('tr');  //accede a la fila
  var tableId = $row.parents('table').attr('id');
  bootstableConfigurations[tableId].params.onBeforeDelete($row);
  $row.remove();
  bootstableConfigurations[tableId].params.onDelete();
}
function switchToEdit($td, index) {  //itera por la columnas
  var tableId = $td.parents('table').attr('id');
  var cont = $td.html(); //lee contenido
  var div = '<div style="display: none;">' + cont + '</div>';  //guarda contenido

  var input = null;
  var columnConfig = getColumnConfigByIndex(index, tableId);
  if (columnConfig) {
      input = columnConfig.input(cont);
  } else {
      input = '<input class="form-control input-sm"  value="' + cont + '">';
  }

  $td.html(div + input);  //fija contenido
}
function rowAddNew(tabId) {  //Agrega fila a la tabla indicada.
  var $tab_en_edic = $("#" + tabId);  //Table to edit
  var $filas = $tab_en_edic.find('tbody tr');
  if ($filas.length==0) {
      //No hay filas de datos. Hay que crearlas completas
      var $row = $tab_en_edic.find('thead tr');  //encabezado
      var $headers = $row.find('th');  //lee campos
      //construye html
      var htmlDat = '';
      $headers.each(function() {
          if ($(this).attr('name')=='buttons') {
              //Es columna de botones
              htmlDat = htmlDat + colEdicHtml;  //agrega botones
          } else {
              htmlDat = htmlDat + '<td></td>';
          }
      });
      $tab_en_edic.find('tbody').append('<tr>' + htmlDat + '</tr>');
      $ultFila = $tab_en_edic.find('tr:last');
  } else {
      //Hay otras filas, podemos clonar la última fila, para copiar los botones
      var $ultFila = $tab_en_edic.find('tr:last');
      $ultFila.clone().appendTo($ultFila.parent());          
      $ultFila = $tab_en_edic.find('tr:last');
  }

  var $cols = $ultFila.find('td');  //lee campos
  $cols.each(function () {
      $(this).empty();
  });

  IterarCamposEdit($cols, switchToEdit, tabId);

  $ultFila.find('td:last').html(saveColHtml);
  $ultFila.attr('new-row', '');
  $ultFila.attr('id', 'editing');

  bootstableConfigurations[tabId].params.onAdd();
}
function TableToCSV(tabId, separator) {  //Convierte tabla a CSV
  var datFil = '';
  var tmp = '';
  var $tab_en_edic = $("#" + tabId);  //Table source
  $tab_en_edic.find('tbody tr').each(function() {
      //Termina la edición si es que existe
      if (ModoEdicion($(this))) {
          $(this).find('#bAcep').click();  //acepta edición
      }
      var $cols = $(this).find('td');  //lee campos
      datFil = '';
      $cols.each(function() {
          if ($(this).attr('name')=='buttons') {
              //Es columna de botones
          } else {
              datFil = datFil + $(this).html() + separator;
          }
      });
      if (datFil!='') {
          datFil = datFil.substr(0, datFil.length - separator.length);            
          tmp = (tmp != '' ? tmp + '\n' : '') + datFil;
      }        
  });
  return tmp;
}
