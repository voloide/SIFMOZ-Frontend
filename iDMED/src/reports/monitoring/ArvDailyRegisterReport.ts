import JsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
 import { saveAs } from 'file-saver'
 import * as ExcelJS from 'exceljs'
 import { MOHIMAGELOG } from 'src/assets/imageBytes.ts'
import Report from 'src/store/models/report/Report'
import ArvDailyRegisterTempReport from 'src/store/models/report/monitoring/ArvDailyRegisterTempReport'
import SystemPlatform from '../SystemPlatform'

const img = new Image()
img.src = require('src/assets/MoHLogo.png')

 const logoTitle = 'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE'
 const title = 'LIVRO DE REGISTO DIÁRIO DE ARVs'
const reportName = 'ArvDailyListReport'
 const fileName = reportName.concat('_' + Report.getFormatDDMMYYYY(new Date()))

export default {
  async downloadPDF (id, fileType, params) {

    let rowsAux = [];
    let data = [];
    if(SystemPlatform.isWebsite()) {
    rowsAux = await Report.api().get(`/arvDailyRegisterReportTemp/printReport/${id}/${fileType}`)
   if (rowsAux.response.status === 204) return rowsAux.response.status
   const firstReg = rowsAux.response.data[0]
   params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate)
   params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate)
    data = this.createArrayOfArrayRow(rowsAux.response.data)
    } else  {
       rowsAux = await this.getDataLocalReport(id)
      if(rowsAux.length === 0) return 204
      params.startDateParam = Report.getFormatDDMMYYYY(rowsAux[0].startDate)
      params.endDateParam = Report.getFormatDDMMYYYY(rowsAux[0].endDate)
      data = this.createArrayOfArrayRow(rowsAux)
    }

    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a3',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart'// or "smart", default is 16
    })

    const headerReport = [
      [
        {
          content: 'LIVRO DE REGISTO DIÁRIO DE ARVs',
          styles: { minCellHeight: 20, fontSize: 16, halign: 'center' },
          colSpan: 3,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold'
      }
      ],
      [
        {
          content: 'Unidade Sanitária: ' + params.clinic.clinicName,
          colSpan: 2,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14'
        },
        {
          content: 'Período: ' + params.startDateParam + ' à ' + params.endDateParam,
          colSpan: 1,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14'
        }
      ],
      [
        {
          content: 'Distrito: ' + (params.district === null ? '' : params.district.description),
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14'
        },
        {
          content: 'Província: ' + (params.province === null ? '' : params.province.description),
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14'
        },
        {
          content: 'Ano: ' + params.year,
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14'
        }
      ]
      ]
  //  const width = doc.internal.pageSize.getWidth()
    const desiredDefinition = [
       [
        { content: 'ORD', rowSpan: 2 },
        { content: 'NID', rowSpan: 2 },
        { content: 'NOME', rowSpan: 2 },
        { content: 'Tipo de paciente', rowSpan: 2 },
        { content: 'Faixa Etária', colSpan: 4 },
        { content: 'Tipo TARV', rowSpan: 2 },
        { content: 'Regime', rowSpan: 2 },
        { content: 'Produtos e Quantidades', rowSpan: 2, styles: { cellWidth: 50 } },
        { content: 'Tipo de Dispensa', rowSpan: 2 },
        { content: 'Linha', rowSpan: 2 },
        { content: 'Data de Levant.', rowSpan: 2 },
        { content: 'Data Proxi. Levant.', rowSpan: 2 },
        { content: 'PROFILAXIA', colSpan: 3 }
       ],
       [
          { content: '[0-4]' },
          { content: '[5-9]:' },
          { content: '[10-14]' },
          { content: '[>15]' },
          { content: 'PPE' },
          { content: 'PREP' },
          { content: 'Cr. Exp.' }
       ]
    ]
 
    autoTable(
      doc,
      {
      //  margin: { top: 10 },
        bodyStyles: {
          halign: 'left',
          valign: 'middle',
          fontSize: 8
        },
        headStyles: {
          halign: 'left',
          valign: 'middle'
        },
        theme: 'grid',
        body: headerReport
      }
    )

    doc.setFontSize(8)
    doc.text('República de Moçambique ', 16, 28)
    doc.text('Ministério da Saúde ', 20, 32)
    doc.addImage(img, 'png', 30, 15, 10, 10)

    autoTable(doc, {
     // margin: { top: 45 },
      bodyStyles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        valign: 'middle',
        // font: 'arial',
        fontSize: 8,
        // cellPadding: 8,
        overflowColumns: 'linebreak',
        minCellHeight: 35
    },
    startY: doc.lastAutoTable.finalY,
    headStyles: {
      valign: 'bottom',
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [230, 230, 230],
      fillColor: [255, 255, 255],
      textColor: [96, 96, 96]
    },
      didDrawPage: function (data) {
        // Header
          doc.setFontSize(10)
          doc.setTextColor(40)
          doc.setFontSize(16)
        doc.setFontSize(10)
        const str = 'Página ' + doc.internal.getNumberOfPages()

        doc.setFontSize(8)
        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        const pageSize = doc.internal.pageSize
        const pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight()
        doc.text(str, data.settings.margin.right, pageHeight - 10)
 },
 didDrawCell: function (data) {
 if (data.row.section === 'body' && data.column.dataKey === 10) {
      console.log(rowsAux)
      const dataRow = (rowsAux)[data.row.index]
      if (dataRow !== undefined) {
        const dataAux2 = (dataRow.drugQuantityTemps) //  cell.row.index
        const datax = []
        for (const row in dataAux2) {
          const createRow = []
          createRow.push(dataAux2[row].drugName)
          createRow.push(dataAux2[row].quantity)
          datax.push(createRow)
          }
        doc.autoTable({
          startY: data.cell.y + 2,
          startX: data.cell.x + 211,
          margin: { left: data.cell.x + 2 },
          tableWidth: 45, // data.cell.width,
          bodyStyles: {
            fontSize: 8
        },
          // tableHeight: data.cell.height,
          // startY: doc.lastAutoTable.finalY + 15,
          rowPageBreak: 'auto',
          showHead: false,
          // theme: 'plain'
          body: datax
        })
      }
}
},
 theme: 'grid',
      head: desiredDefinition,
      body: data
    })

    return doc.save(fileName.concat('.pdf'))
  },

  async downloadExcel (id, fileType2, params) {
   
    let rowsAux = [];
    let data = [];
    if(!SystemPlatform.isWebsite()) {
      const rows = await Report.api().get(`/arvDailyRegisterReportTemp/printReport/${id}/${fileType2}`) 
      if (rows.response.status === 204) return rows.response.status
      data = this.createArrayOfArrayRow(rows.response.data)
    } else  {
       rowsAux = await this.getDataLocalReport(id)
      if(rowsAux.length === 0) return 204
      data = this.createArrayOfArrayRow(rowsAux)
    }
    params.startDateParam = Report.getFormatDDMMYYYY(rowsAux[0].startDate)
    params.endDateParam = Report.getFormatDDMMYYYY(rowsAux[0].endDate)
    console.log('DADOS: ', data)
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'FGH'
    workbook.lastModifiedBy = 'FGH'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()
     // Force workbook calculation on load
    // workbook.calcProperties.fullCalcOnLoad = true
    const worksheet = workbook.addWorksheet(reportName)
      const imageId = workbook.addImage({
      base64: 'data:image/pngbase64,' + MOHIMAGELOG,
      extension: 'png'
    })
    // Get Cells
    const cellRepublica = worksheet.getCell('A8')
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
    const cellFaixaEtaria = worksheet.getCell('E13')
    const cellProfilaxia = worksheet.getCell('P13')
    // const row13Header = worksheet.getCell('A13; R13')

    // Get Rows
    const headerRow = worksheet.getRow(14)
    const row13 = worksheet.getRow(13)
    // Get Columns
    const colA = worksheet.getColumn('A')
    const colB = worksheet.getColumn('B')
    const colC = worksheet.getColumn('C')
    const colD = worksheet.getColumn('D')
    const colE = worksheet.getColumn('E')
    const colF = worksheet.getColumn('F')
    const colG = worksheet.getColumn('G')
    const colH = worksheet.getColumn('H')
    const colI = worksheet.getColumn('I')
    const colJ = worksheet.getColumn('J')
    const colK = worksheet.getColumn('K')
    const colL = worksheet.getColumn('L')
    const colM = worksheet.getColumn('M')
    const colN = worksheet.getColumn('N')
    const colO = worksheet.getColumn('O')
    const colP = worksheet.getColumn('P')
    const colQ = worksheet.getColumn('Q')
    const colR = worksheet.getColumn('R')
    const colS = worksheet.getColumn('S')
    // Format Table Cells
    // Alignment Format
    cellProfilaxia.alignment = cellFaixaEtaria.alignment =
    cellRepublica.alignment =
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
     /*  cellTitle.border =
      cellPharm.border =
      cellDistrictParamValue.border =
      cellDistrict.border =
      cellPharmParamValue.border =
      cellProvince.border =
      cellProvinceParamValue.border =
      cellStartDate.border =
      cellStartDateParamValue.border =
      cellEndDate.border =
      cellEndDateParamValue.border = */
     // cellRepublica.border =
     // cellPharm.border =
      cellDistrictParamValue.border =
      cellDistrict.border =
      // cellPharmParamValue.border =
      cellProvince.border =
      cellProvinceParamValue.border =
     //  cellStartDate.border =
      // cellStartDateParamValue.border =
      cellEndDate.border =
      cellEndDateParamValue.border = {
       // top: { style: 'thin' },
       // left: { style: 'thin' },
      bottom: { style: 'thin' }
     //  right: { style: 'thin' }
     }

      cellProfilaxia.border = cellFaixaEtaria.border =
        {
           top: { style: 'thin' },
           left: { style: 'thin' },
         bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
    // Assign Value to Cell
    cellRepublica.value = logoTitle
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
    cellFaixaEtaria.value = 'Faixa Etária'
    cellProfilaxia.value = 'Profilaxia'
 // merge a range of cells
   // worksheet.mergeCells('A1:A7')
    worksheet.mergeCells('A9:G9')
    worksheet.mergeCells('B11:E11')
    worksheet.mergeCells('B12:C12')
    worksheet.mergeCells('E13:G13')
    worksheet.mergeCells('P13:R13')
   // worksheet.mergeCells('E12:F12')
   // worksheet.mergeCells('A13:G13')
   /* row13Header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1fa37b' },
    bgColor: { argb: '1fa37b' }
  } */
  worksheet.getCell('A13').fill =
  worksheet.getCell('B13').fill =
  worksheet.getCell('C13').fill =
  worksheet.getCell('D13').fill =
  worksheet.getCell('E13').fill =
  worksheet.getCell('F13').fill =
  worksheet.getCell('G13').fill =
  worksheet.getCell('H13').fill =
  worksheet.getCell('I13').fill =
  worksheet.getCell('J13').fill =
  worksheet.getCell('K13').fill =
  worksheet.getCell('L13').fill =
  worksheet.getCell('M13').fill =
  worksheet.getCell('N13').fill =
  worksheet.getCell('O13').fill =
  worksheet.getCell('P13').fill =
  worksheet.getCell('Q13').fill =
  worksheet.getCell('R13').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1fa37b' },
    bgColor: { argb: '1fa37b' }
  }
  cellFaixaEtaria.font = {
    name: 'Arial',
    color: { argb: 'FFFFFFFF' },
    family: 2,
    size: 12,
    italic: false,
    bold: true
  }
  cellProfilaxia.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1fa37b' },
    bgColor: { argb: '1fa37b' }
  }
  cellProfilaxia.font = {
    name: 'Arial',
    color: { argb: 'FFFFFFFF' },
    family: 2,
    size: 12,
    italic: false,
    bold: true
  }
    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30
    row13.height = 30
    // add height size to Columns
    // add width size to Columns
    colA.width = 10
    colB.width = 30
    colC.width = 30
    colD.width = 20
    colE.width = 10
    colF.width = 10
    colG.width = 10
    colH.width = 10
    colI.width = 15
    colJ.width = 25
    colK.width = 50
    colL.width = 15
    colM.width = 15
    colN.width = 15
    colO.width = 15
    colP.width = 15
    colQ.width = 10
    colR.width = 10
    colS.width = 10
    // colG.height = 50

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
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 1 },
      ext: { width: 144, height: 98 }
    })

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
        { name: 'ORD', filterButton: false },
        { name: 'NID', filterButton: false },
        {
          name: 'NOME ',
          filterButton: false
        },
        {
          name: 'TIPO DE PACIENTE',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: '[0 -4]',
          totalsRowFunction: 'none',
          filterButton: false
         },
        {
          name: '[5-9]',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: '[10-14]',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: '[>15]',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'TIPO TARV.',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'REGIME',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'PRODUTOS - (QUANTIDADES) ',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'TIPO DE DISPENSA',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'LINHA',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'DATA DE LEVANTAMENTO',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'DATA PROXIM. LEVANTAMENTO',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'PPE',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'PREP',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'CR. Exp',
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
   // let x = 14
    for (let i = 14; i <= lastTableRowNum; i++) {
      const row = worksheet.getRow(i)
      row.height = 50
      row.halign = 'left'
      row.wrapText = true

    /*  worksheet.mergeCells('A' + (x + 1) + ':A' + (x + 3))
      worksheet.mergeCells('B' + (x + 1) + ':B' + (x + 3))
      worksheet.mergeCells('C' + (x + 1) + ':C' + (x + 3))
      worksheet.mergeCells('D' + (x + 1) + ':D' + (x + 3))
      worksheet.mergeCells('E' + (x + 1) + ':E' + (x + 3))
      worksheet.mergeCells('F' + (x + 1) + ':F' + (x + 3))
      worksheet.mergeCells('G' + (x + 1) + ':G' + (x + 3))
      worksheet.mergeCells('H' + (x + 1) + ':H' + (x + 3))
      worksheet.mergeCells('I' + (x + 1) + ':I' + (x + 3))
      worksheet.mergeCells('J' + (x + 1) + ':J' + (x + 3))
     // worksheet.mergeCells('K' + (i + 1) + ':K' + (i + 3))
     // worksheet.mergeCells('L' + (i + 1) + ':L' + (i + 3))
      worksheet.mergeCells('M' + (x + 1) + ':M' + (x + 3))
      worksheet.mergeCells('N' + (x + 1) + ':N' + (x + 3))
      worksheet.mergeCells('O' + (x + 1) + ':O' + (x + 3))
      worksheet.mergeCells('P' + (x + 1) + ':P' + (x + 3))
      worksheet.mergeCells('Q' + (x + 1) + ':Q' + (x + 3))
      worksheet.mergeCells('R' + (x + 1) + ':R' + (x + 3))
      worksheet.mergeCells('S' + (x + 1) + ':S' + (x + 3)) */
    //  x += 3
     // worksheet.mergeCells('A' + i + ':A' + ((Number(worksheet.lastRow.number) + 3)))
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
    let p = 15
    console.log('(rows.response.data).length: ', (rowsAux).length)
     // Loop through all table's row
     for (let j = 0; j <= (rowsAux).length; j++) {
     // const row = worksheet.getRow(i)
      // Now loop through every row's cell and finally set alignment
       const reportData = (rowsAux)[j]
      //  console.log('ReportDataLenght: ', (rows.response.data).length)
       if (reportData !== undefined) {
     // const subReport = this.createArraySubReport(reportData.drugQuantityTemps)
          let drugDetails = ''
          for (const row in reportData.drugQuantityTemps) {
                // console.log('ROW: ', row)
                // console.log('P: ', p)
                drugDetails = drugDetails + (reportData.drugQuantityTemps[row].drugName + ' - (' + reportData.drugQuantityTemps[row].quantity + ');                                       ')
            }

            const cell = worksheet.getCell('K' + p)
            cell.value = drugDetails
            p++
          // Modify/Add individual cell
            /*   worksheet.addTable({
                  name: reportName,
                  ref: 'K' + p,
                  headerRow: false,
                  totalsRow: false,
                  style: {
                    showRowStripes: false
                  },
                  columns: [
                    { name: 'drugName' },
                    { name: 'quantity' }
                  ],
                  rows: subReport
                })
                p++ */
            //    p += 3
              }
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
          createRow.push(rows[row].orderNumber)
          createRow.push(rows[row].nid)
          createRow.push(rows[row].patientName)
          createRow.push(rows[row].startReason)
          createRow.push(rows[row].ageGroup_0_4)
          createRow.push(rows[row].ageGroup_5_9)
          createRow.push(rows[row].ageGroup_10_14)
          createRow.push(rows[row].ageGroup_Greater_than_15)
          createRow.push(rows[row].patientType)
          createRow.push(rows[row].regime)
          createRow.push('')
          createRow.push(rows[row].dispensationType)
          createRow.push(rows[row].therapeuticLine)
          createRow.push(Report.getFormatDDMMYYYY(rows[row].pickupDate))
          createRow.push(Report.getFormatDDMMYYYY(rows[row].nextPickupDate))
          createRow.push(rows[row].ppe)
          createRow.push(rows[row].prep)
          createRow.push('')
          data.push(createRow)
      }
      return data
    },



    async getDataLocalReport(reportId) {
      const reportData = []
      await ArvDailyRegisterTempReport.localDbGetAll().then(reports => {
          reports.forEach(report => {
                  if (report.reportId === reportId) {
                   reportData.push(report)
                  }
             })
             //console.log(data)
         })
         if(reportData.length === 0) return '204'
         return reportData
       //  return reportData
    }
  }
