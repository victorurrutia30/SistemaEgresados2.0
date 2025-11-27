using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Web;

namespace SistemaEgresados.Servicios
{
    public class GenerarExcel
    {
        public byte[] CrearExcel<T>(IEnumerable<T> datos, string nombreHoja, string tituloReporte)
        {
            if (datos == null || !datos.Any())
                return null;

            using (var package = new ExcelPackage())
            {
                ExcelWorksheet ws = package.Workbook.Worksheets.Add(nombreHoja);
                var props = typeof(T).GetProperties();

                int colCount = props.Length;
                ws.Cells[1, 1].Value = tituloReporte;
                ws.Cells[1, 1, 1, colCount].Merge = true;
                ws.Cells[1, 1].Style.Font.Bold = true;
                ws.Cells[1, 1].Style.Font.Size = 16;
                ws.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                int col = 1;
                foreach (var p in props)
                {
                    ws.Cells[3, col].Value = p.Name;
                    ws.Cells[3, col].Style.Font.Bold = true;
                    ws.Cells[3, col].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    ws.Cells[3, col].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(30, 90, 150));
                    ws.Cells[3, col].Style.Font.Color.SetColor(Color.White);
                    ws.Cells[3, col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                    ws.Cells[3, col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    col++;
                }

                int row = 4;
                foreach (var item in datos)
                {
                    col = 1;
                    foreach (var p in props)
                    {
                        var val = p.GetValue(item);
                        ws.Cells[row, col].Value = val;

                        if (val is DateTime)
                        {
                            ws.Cells[row, col].Style.Numberformat.Format = "yyyy-MM-dd";
                        }

                        ws.Cells[row, col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Gray);

                        col++;
                    }
                    row++;
                }

                ws.Cells[ws.Dimension.Address].AutoFitColumns();

                ws.Row(3).Height = 22;

                return package.GetAsByteArray();
            }
        }
    }
}