import * as xl from "excel4node";


export const generarListadoHtml = (listado_articulos) => {
  let html = `
  <table id="tabla" style="text-align: center;">
    <tr style="background-color: rgba(0, 0, 177, 0.5); border-bottom: solid 5px; border-color:rgba(0, 0, 128, 0.8)">
        <th style="padding: 10px;">PRODUCTO</th>
        <th style="padding: 10px;">BANDA</th>
        <th style="padding: 10px;">MINIMO</th>
        <th style="padding: 10px;">MAXIMO</th>
        <th style="padding: 10px;">CANTIDAD</th>
    </tr>`;
  for (const item of listado_articulos) {
    html += `
    <tr>
        <td style="padding: 8px;">${item.producto}</td>
        <td style="padding: 8px;">${item.banda}</td>
        <td style="padding: 8px;">${item.min}</td>
        <td style="padding: 8px;">${item.max}</td>
        <td style="padding: 8px;">${item.cantidad}</td>
    </tr>
    `;
  }
  html += `
        </tr>
    </table>`;
  // generararExcel(listado_articulos)
  return html;
};

export const generararExcel = (listado_articulos) => {
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Pedido'); 
    
    let headingColumnNames = ['PEDIDO','BANDA','MINIMO','MAXIMO','CANTIDAD']
    let headingColumnIndex = 1;
    headingColumnNames.forEach(heading => {
        ws.cell(1, headingColumnIndex++)
            .string(heading)
    });

    let rowIndex = 2;
    listado_articulos.forEach( record => {
        record.cantidad = record.cantidad.toString()
        let columnIndex = 1;
        Object.keys(record).forEach(columnName =>{
            ws.cell(rowIndex,columnIndex++).string(record [columnName])
        });
        rowIndex++;
    });

    const date = new Date();

    let path = `./files/pedido_${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}.xlsx`

    wb.write(path)

    return path
};
