# Bootstable
Javascript library to make HMTL tables editable, using Bootstrap

![Bootstable](http://blog.pucp.edu.pe/blog/tito/wp-content/uploads/sites/610/2018/01/Sin-título-13.png "Bootstable")

"Bootstable" is a javascript library (plug-in), that lets convert a HTML static table to a editable table. 
A table is made editable, including several buttons to perform the edition actions.

Edition options includes:

* Edit fields.
* Remove rows.
* Add rows. (require and aditional button)

Dependencies:

* Jquery
* Bootstrap

Bootstrap is necessary to format correctly the controls used, and to draw icons.

No database connection is included. The library was designed to work offline, when editing.

Examples:

Sets all the columns of #mytable editable:

      $('#mytable').SetEditable();

Sets the columns 0 and 1 of #mytable editable:

      $('#mytable').SetEditable({
                    columnsEd: "0,1" //editable columns 
      });

Make the second column a dropdown when in edit mode:

      $('#mytable').SetEditable({
                    columnsConfig: [{
                        index: 1,
                        input: function (existingValue) {
                              return `<select id="encodeUrl">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    </select>
                                    <script>$("#encodeUrl").val("`+ existingValue + `");<\/script>`;
                        },
                        value: function () {
                              return $('#encodeUrl').val();
                        }
                  }
      });

Includes a "New row" button:

      $('#mytable').SetEditable({
                    columnsEd: "0,1", 
                    $addButton: $('#but_add')
      });

IMPORTANT: Bootstable need the ID of the table to edit, and can only work on a single table. 

      $('.mytable').SetEditable();  //BAD! No class reference allowed.
      $('table').SetEditable();     //BAD! No several tables allowed.

If several tables need to be editable in a same Web page, it's needed to set each table:

      $('#mytable1').SetEditable();
      $('#mytable2').SetEditable();

Parameters:

        columnsEd: null,         //Index to editable columns. If null all td editables. Ex.: "1,2,3,4,5"
        columnsConfig: null,     //Array of objects with index, input and value properties 
        $addButton: null,        //Jquery object of "Add" button
        onEdit: function() {},   //Called after edition
        onBeforeDelete: function() {}, //Called before deletion
        onDelete: function() {}, //Called after deletion
        onAdd: function() {}     //Called when added a new row
