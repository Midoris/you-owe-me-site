import Foundation
import CoreGraphics
import CoreImage
import CoreImage.CIFilterBuiltins
import CryptoKit
import ImageIO
import UniformTypeIdentifiers
import Vision

struct HandoffCode {
  let filename: String
  let url: String
}

let codes = [
  HandoffCode(filename: "home.png", url: "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?pt=117888502&ct=website_qr_exp006&mt=8"),
  HandoffCode(filename: "roommate.png", url: "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=18039f2b-da9e-4d5f-9ba1-b60f117ecf12&pt=117888502&ct=website_qr_exp006&mt=8"),
  HandoffCode(filename: "split.png", url: "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=7f9074ac-4090-4e07-aebe-c5722e76eedc&pt=117888502&ct=website_qr_exp006&mt=8"),
  HandoffCode(filename: "money-owed.png", url: "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db&pt=117888502&ct=website_qr_exp006&mt=8"),
  HandoffCode(filename: "repayment-plan.png", url: "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049&pt=117888502&ct=website_qr_exp006&mt=8"),
]

let outputDirectory = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
  .appendingPathComponent("images/shared/iphone-handoff", isDirectory: true)
let context = CIContext(options: [.useSoftwareRenderer: false])
let pixelScale: CGFloat = 8
let quietZoneModules: CGFloat = 4

func fail(_ message: String) -> Never {
  FileHandle.standardError.write(Data((message + "\n").utf8))
  exit(1)
}

func makeQRCode(for string: String) -> CGImage {
  let filter = CIFilter.qrCodeGenerator()
  filter.message = Data(string.utf8)
  filter.correctionLevel = "M"
  guard let source = filter.outputImage else { fail("Could not create QR image.") }

  let scaled = source.transformed(by: CGAffineTransform(scaleX: pixelScale, y: pixelScale))
  let quietZone = quietZoneModules * pixelScale
  let canvas = CGRect(
    x: 0,
    y: 0,
    width: scaled.extent.width + (quietZone * 2),
    height: scaled.extent.height + (quietZone * 2)
  )
  let background = CIImage(color: CIColor.white).cropped(to: canvas)
  let image = scaled
    .transformed(by: CGAffineTransform(translationX: quietZone, y: quietZone))
    .composited(over: background)

  guard let cgImage = context.createCGImage(image, from: canvas) else { fail("Could not render QR image.") }
  return cgImage
}

func writePNG(_ image: CGImage, to url: URL) {
  guard let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    fail("Could not create PNG destination for \(url.lastPathComponent).")
  }
  CGImageDestinationAddImage(destination, image, nil)
  guard CGImageDestinationFinalize(destination) else { fail("Could not write \(url.lastPathComponent).") }
}

func decodedPayload(from image: CGImage) -> String? {
  let request = VNDetectBarcodesRequest()
  request.symbologies = [.qr]
  let handler = VNImageRequestHandler(cgImage: image)
  do {
    try handler.perform([request])
  } catch {
    fail("Vision could not decode the QR image: \(error.localizedDescription)")
  }
  return request.results?.first?.payloadStringValue
}

func decodedPayload(fromPNGAt url: URL) -> String? {
  guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
        let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    fail("Could not reopen saved PNG \(url.lastPathComponent).")
  }
  return decodedPayload(from: image)
}

do {
  try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
} catch {
  fail("Could not create output directory: \(error.localizedDescription)")
}

var manifestCodes: [[String: String]] = []
for code in codes {
  let image = makeQRCode(for: code.url)
  let fileURL = outputDirectory.appendingPathComponent(code.filename)
  writePNG(image, to: fileURL)
  guard decodedPayload(fromPNGAt: fileURL) == code.url else { fail("Saved PNG payload did not exactly match \(code.filename).") }
  guard let data = try? Data(contentsOf: fileURL) else { fail("Could not read \(code.filename) for hashing.") }
  manifestCodes.append([
    "filename": code.filename,
    "url": code.url,
    "sha256": SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined(),
  ])
}

let manifest: [String: Any] = [
  "generator": "scripts/generate-iphone-handoff-qr.swift",
  "correction_level": "M",
  "pixel_scale": Int(pixelScale),
  "extra_quiet_zone_modules": Int(quietZoneModules),
  "codes": manifestCodes,
]
guard let manifestData = try? JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted, .sortedKeys]) else {
  fail("Could not encode QR manifest.")
}
do {
  try manifestData.write(to: outputDirectory.appendingPathComponent("manifest.json"))
} catch {
  fail("Could not write QR manifest: \(error.localizedDescription)")
}

print("Generated and independently decoded \(codes.count) iPhone handoff QR codes.")
