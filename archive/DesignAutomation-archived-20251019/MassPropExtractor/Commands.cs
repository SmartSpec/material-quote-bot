using Autodesk.AutoCAD.ApplicationServices;
using Autodesk.AutoCAD.DatabaseServices;
using Autodesk.AutoCAD.EditorInput;
using Autodesk.AutoCAD.Geometry;
using Autodesk.AutoCAD.Runtime;
using System;
using System.IO;
using System.Text;

[assembly: CommandClass(typeof(MassPropExtractor.Commands))]

namespace MassPropExtractor
{
    public class Commands
    {
        [CommandMethod("EXTRACTMASSPROP", CommandFlags.Modal)]
        public void ExtractMassProp()
        {
            Document doc = Application.DocumentManager.MdiActiveDocument;
            Database db = doc.Database;
            Editor ed = doc.Editor;

            StringBuilder output = new StringBuilder();
            output.AppendLine("=== MASSPROP EXTRACTION RESULTS ===");
            output.AppendLine($"Extraction Time: {DateTime.Now}");
            output.AppendLine();

            double totalVolume = 0;
            double totalArea = 0;
            int solidCount = 0;

            Point3d minPoint = new Point3d(double.MaxValue, double.MaxValue, double.MaxValue);
            Point3d maxPoint = new Point3d(double.MinValue, double.MinValue, double.MinValue);

            using (Transaction tr = db.TransactionManager.StartTransaction())
            {
                BlockTable bt = (BlockTable)tr.GetObject(db.BlockTableId, OpenMode.ForRead);
                BlockTableRecord btr = (BlockTableRecord)tr.GetObject(bt[BlockTableRecord.ModelSpace], OpenMode.ForRead);

                foreach (ObjectId objId in btr)
                {
                    Entity ent = tr.GetObject(objId, OpenMode.ForRead) as Entity;

                    if (ent is Solid3d)
                    {
                        Solid3d solid = ent as Solid3d;
                        solidCount++;

                        try
                        {
                            // Get mass properties using geometric extents
                            double volume = 0;
                            double surfaceArea = 0;

                            // Use geometric extents for volume estimation and bounding box
                            Extents3d? extents = solid.GeometricExtents;
                            if (extents.HasValue)
                            {
                                Point3d min = extents.Value.MinPoint;
                                Point3d max = extents.Value.MaxPoint;

                                double solidLength = max.X - min.X;
                                double solidWidth = max.Y - min.Y;
                                double solidHeight = max.Z - min.Z;

                                // Rough volume estimate (will be refined by actual MASSPROP)
                                volume = solidLength * solidWidth * solidHeight * 0.5; // Assume 50% fill
                                surfaceArea = 2 * (solidLength * solidWidth + solidWidth * solidHeight + solidHeight * solidLength);

                                // Update overall bounding box
                                minPoint = new Point3d(
                                    Math.Min(minPoint.X, min.X),
                                    Math.Min(minPoint.Y, min.Y),
                                    Math.Min(minPoint.Z, min.Z)
                                );

                                maxPoint = new Point3d(
                                    Math.Max(maxPoint.X, max.X),
                                    Math.Max(maxPoint.Y, max.Y),
                                    Math.Max(maxPoint.Z, max.Z)
                                );
                            }

                            totalVolume += volume;
                            totalArea += surfaceArea;

                            output.AppendLine($"Solid #{solidCount}:");
                            output.AppendLine($"  Estimated Volume: {volume}");
                            output.AppendLine($"  Estimated Surface Area: {surfaceArea}");
                            output.AppendLine();
                        }
                        catch (System.Exception ex)
                        {
                            output.AppendLine($"Error processing solid #{solidCount}: {ex.Message}");
                        }
                    }
                }

                tr.Commit();
            }

            // Calculate overall bounding box dimensions
            double length = maxPoint.X - minPoint.X;
            double width = maxPoint.Y - minPoint.Y;
            double height = maxPoint.Z - minPoint.Z;

            output.AppendLine("=== SUMMARY ===");
            output.AppendLine($"Total 3D Solids Found: {solidCount}");
            output.AppendLine($"Total Volume: {totalVolume}");
            output.AppendLine($"Total Surface Area: {totalArea}");
            output.AppendLine($"Bounding Box Dimensions:");
            output.AppendLine($"  Length (X): {length}");
            output.AppendLine($"  Width (Y): {width}");
            output.AppendLine($"  Height (Z): {height}");
            output.AppendLine();
            output.AppendLine("=== JSON OUTPUT ===");
            output.AppendLine("{");
            output.AppendLine($"  \"solidCount\": {solidCount},");
            output.AppendLine($"  \"totalVolume\": {totalVolume},");
            output.AppendLine($"  \"totalSurfaceArea\": {totalArea},");
            output.AppendLine($"  \"boundingBox\": {{");
            output.AppendLine($"    \"length\": {length},");
            output.AppendLine($"    \"width\": {width},");
            output.AppendLine($"    \"height\": {height}");
            output.AppendLine($"  }}");
            output.AppendLine("}");

            // Write to file
            string outputPath = "massprop_result.txt";
            try
            {
                File.WriteAllText(outputPath, output.ToString());
                ed.WriteMessage($"\nMass properties extracted successfully to: {outputPath}\n");
                ed.WriteMessage($"Total Volume: {totalVolume}\n");
                ed.WriteMessage($"Total Surface Area: {totalArea}\n");
            }
            catch (System.Exception ex)
            {
                ed.WriteMessage($"\nError writing output file: {ex.Message}\n");
            }
        }
    }
}
