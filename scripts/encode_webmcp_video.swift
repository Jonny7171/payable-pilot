import AppKit
import AVFoundation
import CoreVideo
import Foundation

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let frameDirectory = root.appendingPathComponent("output/webmcp/frames")
let outputDirectory = root.appendingPathComponent("output/webmcp")
let silentURL = outputDirectory.appendingPathComponent("payable-pilot-webmcp-silent.mp4")
let narrationURL = outputDirectory.appendingPathComponent("payable-pilot-webmcp.aiff")
let outputURL = outputDirectory.appendingPathComponent("payable-pilot-webmcp.mp4")
let frameRate: Int32 = 30
let width = 1920
let height = 1080
let durations = [9, 16, 17, 18, 16, 19]

try? FileManager.default.removeItem(at: silentURL)
try? FileManager.default.removeItem(at: outputURL)

let writer = try AVAssetWriter(outputURL: silentURL, fileType: .mp4)
let input = AVAssetWriterInput(
    mediaType: .video,
    outputSettings: [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: width,
        AVVideoHeightKey: height,
        AVVideoCompressionPropertiesKey: [
            AVVideoAverageBitRateKey: 5_000_000,
            AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        ],
    ]
)
input.expectsMediaDataInRealTime = false

let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: input,
    sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
        kCVPixelBufferWidthKey as String: width,
        kCVPixelBufferHeightKey as String: height,
    ]
)

guard writer.canAdd(input) else { fatalError("Unable to add video input") }
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

func loadCGImage(_ url: URL) -> CGImage {
    guard let image = NSImage(contentsOf: url),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        fatalError("Unable to load \(url.path)")
    }
    return cgImage
}

func makePixelBuffer(image: CGImage, progress: Double, animate: Bool) -> CVPixelBuffer {
    var buffer: CVPixelBuffer?
    let status = CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &buffer)
    guard status == kCVReturnSuccess, let pixelBuffer = buffer else {
        fatalError("Unable to create a pixel buffer")
    }

    CVPixelBufferLockBaseAddress(pixelBuffer, [])
    defer { CVPixelBufferUnlockBaseAddress(pixelBuffer, []) }

    guard let baseAddress = CVPixelBufferGetBaseAddress(pixelBuffer),
          let context = CGContext(
              data: baseAddress,
              width: width,
              height: height,
              bitsPerComponent: 8,
              bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer),
              space: CGColorSpaceCreateDeviceRGB(),
              bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
          ) else {
        fatalError("Unable to create a frame context")
    }

    context.setFillColor(NSColor.black.cgColor)
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))

    let zoom = animate ? 1.0 + (0.01 * progress) : 1.0
    let drawWidth = Double(width) * zoom
    let drawHeight = Double(height) * zoom
    let x = (Double(width) - drawWidth) / 2.0
    let y = (Double(height) - drawHeight) / 2.0
    context.draw(image, in: CGRect(x: x, y: y, width: drawWidth, height: drawHeight))
    return pixelBuffer
}

var frameIndex: Int64 = 0
for sceneIndex in 1...6 {
    let sceneURL = frameDirectory.appendingPathComponent("scene-\(sceneIndex).png")
    let image = loadCGImage(sceneURL)
    let sceneFrames = durations[sceneIndex - 1] * Int(frameRate)

    for sceneFrame in 0..<sceneFrames {
        while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.002) }
        let progress = sceneFrames > 1 ? Double(sceneFrame) / Double(sceneFrames - 1) : 0.0
        let buffer = makePixelBuffer(image: image, progress: progress, animate: sceneIndex == 2 || sceneIndex == 4)
        let time = CMTime(value: frameIndex, timescale: frameRate)
        guard adaptor.append(buffer, withPresentationTime: time) else {
            fatalError("Unable to append frame \(frameIndex): \(writer.error?.localizedDescription ?? "unknown error")")
        }
        frameIndex += 1
    }
}

input.markAsFinished()
let writingSemaphore = DispatchSemaphore(value: 0)
writer.finishWriting { writingSemaphore.signal() }
writingSemaphore.wait()
guard writer.status == .completed else {
    fatalError("Video encoding failed: \(writer.error?.localizedDescription ?? "unknown error")")
}

let videoAsset = AVURLAsset(url: silentURL)
let narrationAsset = AVURLAsset(url: narrationURL)
let composition = AVMutableComposition()

guard let sourceVideo = videoAsset.tracks(withMediaType: .video).first,
      let videoTrack = composition.addMutableTrack(
          withMediaType: .video,
          preferredTrackID: kCMPersistentTrackID_Invalid
      ) else {
    fatalError("Unable to read encoded video")
}
try videoTrack.insertTimeRange(
    CMTimeRange(start: .zero, duration: videoAsset.duration),
    of: sourceVideo,
    at: .zero
)

guard let sourceAudio = narrationAsset.tracks(withMediaType: .audio).first,
      let audioTrack = composition.addMutableTrack(
          withMediaType: .audio,
          preferredTrackID: kCMPersistentTrackID_Invalid
      ) else {
    fatalError("Unable to read narration")
}
let audioDuration = CMTimeMinimum(narrationAsset.duration, videoAsset.duration)
try audioTrack.insertTimeRange(
    CMTimeRange(start: .zero, duration: audioDuration),
    of: sourceAudio,
    at: .zero
)

guard let exporter = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
    fatalError("Unable to create final export")
}
exporter.outputURL = outputURL
exporter.outputFileType = .mp4
exporter.shouldOptimizeForNetworkUse = true

let exportSemaphore = DispatchSemaphore(value: 0)
exporter.exportAsynchronously { exportSemaphore.signal() }
exportSemaphore.wait()

guard exporter.status == .completed else {
    fatalError("Final export failed: \(exporter.error?.localizedDescription ?? "unknown error")")
}

print(outputURL.path)
