import JsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import * as ExcelJS from 'exceljs'
// import { MOHIMAGELOG } from 'src/assets/imageBytes.ts'
import Report from 'src/store/models/report/Report'

// const logoTitle = 'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE'
const title = 'Lista de Stock Usado'
const reportName = 'ListaDeStockUsado'
 const fileName = reportName.concat('_' + Report.getFormatDDMMYYYY(new Date()))

export default {
  async downloadPDF (id, fileType, params) {
    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart'// or "smart", default is 16
    })
    const width = doc.internal.pageSize.getWidth()
    /*
      Fill Table
    */
    const cols = [
      'Medicamento',
      'FNM',
      'Saldo',
      'Recebidos',
      'Saídas',
      'Ajustes',
      'Stock Actual'
    ]
    const rowsAux = await Report.api().get(`/usedStockReportTemp/printReport/${id}/${fileType}`) 
    if (rowsAux.response.status === 204) return rowsAux.response.status
    const firstReg = rowsAux.response.data[0]
    params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate)
    params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate)
 

    const data = this.createArrayOfArrayRow(rowsAux.response.data)
    autoTable(doc, {
      margin: { top: 55 },
      bodyStyles: {
        halign: 'left',
        valign: 'middle'
      },
      headStyles: {
        halign: 'center',
        valign: 'middle'
      },
      didDrawPage: function (data) {
        // Header
          doc.setFontSize(10)
          doc.setTextColor(40)
          doc.setFontSize(16)
          doc.text(title,
            width / 2,
            20,
            {
              align: 'center'
            }
          )
        doc.setFontSize(10)
        doc.text('Unidade Sanitaria: ' + params.clinic.clinicName, data.settings.margin.left + 2, 32)
        doc.text('Província: ' + (params.province === null ? '' : params.province.description), data.settings.margin.left + 2, 40)
        doc.text('Distrito: ' + (params.district === null ? '' : params.district.description), data.settings.margin.left + 2, 48)
        doc.text('Data Início: ' + params.startDateParam, width / 2 + 95, 32)
        doc.text('Data Fim: ' + params.endDateParam, width / 2 + 95, 40)

        doc.setFontSize(10)
        const str = 'Página ' + doc.internal.getNumberOfPages()

        doc.setFontSize(10)
        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        const pageSize = doc.internal.pageSize
        const pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight()
        doc.text(str, data.settings.margin.right, pageHeight - 10)
 },
      theme: 'grid',
      head: [cols],
      body: data
    })

    return doc.save(fileName.concat('.pdf'))
  },

  async downloadExcel (id, fileType2, params) {
    const rows = await Report.api().get(`/usedStockReportTemp/printReport/${id}/${fileType2}`) 
    if (rows.response.status === 204) return rows.response.status
    const firstReg = rows.response.data[0]
    params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate)
    params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate)

 
      const data = this.createArrayOfArrayRow(rows.response.data)
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'FGH'
      workbook.lastModifiedBy = 'FGH'
      workbook.created = new Date()
      workbook.modified = new Date()
      workbook.lastPrinted = new Date()
       // Force workbook calculation on load
      // workbook.calcProperties.fullCalcOnLoad = true
      const worksheet = workbook.addWorksheet(reportName)
   /*   const imageId = workbook.addImage({
        base64: 'data:image/pngbase64,' + MOHIMAGELOG,
        extension: 'png'
      }) */
      // Get Cells
      /* const cellRepublica = worksheet.getCell('A8') */
      const cellTitle = worksheet.getCell('A9')
      const cellPharm = worksheet.getCell('A11')
      const cellDistrict = worksheet.getCell('A12')
      const cellProvince = worksheet.getCell('D12')
      const cellStartDate = worksheet.getCell('F11')
      const cellEndDate = worksheet.getCell('F12')
      const cellPharmParamValue = worksheet.getCell('B11')
      const cellDistrictParamValue = worksheet.getCell('B12')
      const cellProvinceParamValue = worksheet.getCell('E12')
      const cellStartDateParamValue = worksheet.getCell('G11')
      const cellEndDateParamValue = worksheet.getCell('G12')
      // Get Rows
      const headerRow = worksheet.getRow(14)
      // Get Columns
      const colA = worksheet.getColumn('A')
      const colB = worksheet.getColumn('B')
      const colC = worksheet.getColumn('C')
      const colD = worksheet.getColumn('D')
      const colE = worksheet.getColumn('E')
      const colF = worksheet.getColumn('F')
      const colG = worksheet.getColumn('G')
      const colH = worksheet.getColumn('H')
      // Format Table Cells
      // Alignment Format
     // cellRepublica.alignment =
        cellTitle.alignment =
         headerRow.alignment =
          {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true
          }
      cellPharm.alignment =
        cellDistrict.alignment =
        cellProvince.alignment =
        cellStartDate.alignment =
        cellEndDate.alignment =
          {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: false
          }
      // Border Format
     //  cellRepublica.border =
        cellTitle.border =
        cellPharm.border =
        cellDistrictParamValue.border =
        cellDistrict.border =
        cellPharmParamValue.border =
        cellProvince.border =
        cellProvinceParamValue.border =
        cellStartDate.border =
        cellStartDateParamValue.border =
        cellEndDate.border =
        cellEndDateParamValue.border =
          {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
      // Assign Value to Cell
    //  cellRepublica.value = logoTitle
       cellTitle.value = title
      cellPharmParamValue.value = params.clinic !== null ? params.clinic.clinicName : ''
      cellProvinceParamValue.value = params.province !== null ? params.province.description : ''
      cellDistrictParamValue.value = params.district !== null ? params.district.description : ''
      cellStartDateParamValue.value = params.startDateParam
      cellEndDateParamValue.value = params.endDateParam
      cellPharm.value = 'Farmácia'
      cellDistrict.value = 'Distrito'
      cellProvince.value = 'Província'
      cellStartDate.value = 'Data Início'
      cellEndDate.value = 'Data Fim'
   // merge a range of cells
     // worksheet.mergeCells('A1:A7')
      worksheet.mergeCells('A9:G9')
      worksheet.mergeCells('B11:E11')
      worksheet.mergeCells('B12:C12')
     // worksheet.mergeCells('E12:F12')
      worksheet.mergeCells('A13:G13')
      // add width size to Columns
      // add height size to Rows
      headerRow.height = 30
      // add height size to Columns
      // add width size to Columns
      colA.width = 60
      colB.width = 30
      colC.width = 15
      colD.width = 15
      colE.width = 15
      colF.width = 15
      colG.width = 15
      colH.width = 15

      // Add Style
        cellTitle.font =
        cellDistrict.font =
        cellProvince.font =
        cellStartDate.font =
        cellEndDate.font =
        cellPharm.font =
          {
            name: 'Arial',
            family: 2,
            size: 11,
            italic: false,
            bold: true
          }
      // Add Image
     /* worksheet.addImage(imageId, {
        tl: { col: 0, row: 1 },
        ext: { width: 144, height: 98 }
      }) */
        // Cereate Table
        worksheet.addTable({
        name: reportName,
        ref: 'A14',
        headerRow: true,
        totalsRow: false,
        style: {
          showRowStripes: false
        },

        columns: [
          { name: 'Medicamento', filterButton: false },
          { name: 'FNM', filterButton: false },
          {
            name: 'Saldo',
            totalsRowFunction: 'none',
            filterButton: false
          },
          {
            name: 'Recebidos',
            totalsRowFunction: 'none',
            filterButton: false
          },
          {
            name: 'Saídas',
            totalsRowFunction: 'none',
            filterButton: false
          },
          {
            name: 'Ajustes',
            totalsRowFunction: 'none',
            filterButton: false
          },
          {
            name: 'Stock Actual',
            totalsRowFunction: 'none',
            filterButton: false
          }
        ],
        rows: data
      })
      // Format all data cells
      const lastRowNum =
        worksheet.lastRow.number !== undefined ? worksheet.lastRow.number : 0
      const lastTableRowNum = lastRowNum
       // Loop through all table's row
      for (let i = 14; i <= lastTableRowNum; i++) {
        const row = worksheet.getRow(i)
        row.height = 30
        // Now loop through every row's cell and finally set alignment
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true
          }
          if (i === 14) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '1fa37b' },
              bgColor: { argb: '1fa37b' }
            }
            cell.font = {
              name: 'Arial',
              color: { argb: 'FFFFFFFF' },
              family: 2,
              size: 11,
              italic: false,
              bold: true
            }
          }
        })
      }
      const buffer = await workbook.xlsx.writeBuffer()
      const fileType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      const fileExtension = '.xlsx'
      const blob = new Blob([buffer], { type: fileType })
      saveAs(blob, fileName + fileExtension)
    },
     createArrayOfArrayRow (rows) {
      const data = []
       for (const row in rows) {
          const createRow = []
          createRow.push(rows[row].drugName)
          createRow.push(rows[row].fnName)
          createRow.push(rows[row].balance)
          createRow.push(rows[row].receivedStock)
          createRow.push(rows[row].stockIssued)
          createRow.push(rows[row].adjustment)
          createRow.push(rows[row].actualStock)
          data.push(createRow)
      }
      return data
    }
  }
