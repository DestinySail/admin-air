<script setup lang="ts">
import gsap from 'gsap'
import { nextTick, onActivated, onMounted, onUnmounted, useTemplateRef } from 'vue'

defineOptions({
    name: 'dashboard',
})

const SIGNATURE_OUTLINE_PATH = [
    `M 118.78 178.40 C 118.78 180.16, 118.05 182.18, 116.58 184.45 C 115.11 186.72, 113.65 187.86, 112.18 187.86
    C 109.69 187.86, 107.78 186.32, 106.46 183.24 C 105.14 180.16, 104.48 176.57, 104.48 172.46
    C 104.48 168.94, 104.70 158.38, 105.14 140.78 L 105.36 132.42 C 105.36 129.05, 104.48 126.63, 102.72 125.16
    C 96.12 136.31, 89.96 145.99, 84.24 154.20 C 78.52 162.41, 71.26 170.15, 62.46 177.41
    C 53.66 184.67, 44.42 188.30, 34.74 188.30 C 30.05 188.30, 26.42 186.83, 23.85 183.90
    C 21.28 180.97, 20.00 177.15, 20.00 172.46 C 20.00 166.59, 22.64 158.56, 27.92 148.37
    C 33.20 138.18, 39.95 127.84, 48.16 117.35 C 56.37 106.86, 64.59 98.25, 72.80 91.50
    C 78.23 87.10, 82.55 84.13, 85.78 82.59 C 89.01 81.05, 91.87 80.28, 94.36 80.28
    C 96.71 80.28, 99.13 81.01, 101.62 82.48 C 104.11 83.95, 106.24 86.00, 108.00 88.64
    C 109.76 91.28, 110.64 94.29, 110.64 97.66 C 110.64 102.21, 109.39 106.53, 106.90 110.64
    L 110.64 109.54 C 112.25 109.54, 113.21 111.52, 113.50 115.48 C 113.65 117.83, 113.83 122.59, 114.05 129.78
    C 114.27 136.97, 114.45 142.91, 114.60 147.60 C 114.75 152.44, 114.89 157.13, 115.04 161.68
    C 115.19 166.23, 115.33 169.82, 115.48 172.46 C 115.63 173.49, 116.21 174.55, 117.24 175.65
    C 118.27 176.75, 118.78 177.67, 118.78 178.40 Z
    M 99.64 116.58 C 101.40 112.18, 102.28 107.41, 102.28 102.28 C 102.28 99.20, 101.36 96.52, 99.53 94.25
    C 97.70 91.98, 95.24 90.84, 92.16 90.84 C 88.49 90.84, 83.80 93.33, 78.08 98.32
    C 71.48 103.89, 64.51 111.34, 57.18 120.65 C 49.85 129.96, 43.76 139.17, 38.92 148.26
    C 34.08 157.35, 31.66 164.54, 31.66 169.82 C 31.66 174.22, 33.71 176.42, 37.82 176.42
    C 45.74 176.42, 53.37 173.49, 60.70 167.62 C 68.03 161.75, 74.60 154.75, 80.39 146.61
    C 86.18 138.47, 92.60 128.46, 99.64 116.58 Z`,
    `M 223.04 36.06 C 223.04 38.99, 222.90 44.75, 222.60 53.33 C 222.31 61.91, 222.16 70.53, 222.16 79.18
    C 222.16 95.90, 222.53 112.95, 223.26 130.33 C 224.00 147.71, 224.58 159.11, 225.02 164.54
    C 225.02 165.42, 225.10 166.37, 225.24 167.40 C 225.39 168.43, 225.54 169.38, 225.68 170.26
    C 226.27 174.37, 226.56 176.86, 226.56 177.74 C 226.56 179.21, 225.50 180.60, 223.37 181.92
    C 221.25 183.24, 219.60 183.90, 218.42 183.90 C 216.81 183.90, 215.75 183.28, 215.23 182.03
    C 214.72 180.78, 214.46 179.06, 214.46 176.86 C 214.46 168.79, 214.68 160.36, 215.12 151.56
    L 215.34 139.24 C 215.34 135.13, 215.27 129.74, 215.12 123.07 C 214.98 116.40, 214.76 110.79, 214.46 106.24
    C 206.98 130.29, 198.51 150.20, 189.05 165.97 C 179.59 181.74, 169.36 189.62, 158.36 189.62
    C 153.38 189.62, 149.16 187.27, 145.71 182.58 C 142.27 177.89, 140.54 171.14, 140.54 162.34
    C 140.54 150.75, 144.47 138.14, 152.31 124.50 C 160.16 110.86, 169.11 99.13, 179.15 89.30
    C 189.20 79.47, 196.64 74.56, 201.48 74.56 C 206.18 74.56, 208.52 76.10, 208.52 79.18
    C 208.52 81.23, 207.83 83.62, 206.43 86.33 C 205.04 89.04, 203.50 91.50, 201.81 93.70
    C 200.13 95.90, 199.14 97.00, 198.84 97.00 C 198.55 97.00, 198.22 96.89, 197.85 96.67
    C 197.49 96.45, 197.30 96.19, 197.30 95.90 C 197.30 95.17, 197.67 93.92, 198.40 92.16
    C 199.14 90.40, 199.50 89.23, 199.50 88.64 C 199.50 87.91, 199.43 87.39, 199.28 87.10
    C 199.14 86.81, 198.70 86.66, 197.96 86.66 C 194.88 86.66, 189.35 90.88, 181.35 99.31
    C 173.36 107.74, 166.21 117.75, 159.90 129.34 C 153.60 140.93, 150.44 151.71, 150.44 161.68
    C 150.44 165.20, 151.18 168.50, 152.64 171.58 C 154.11 174.66, 156.53 176.20, 159.90 176.20
    C 170.61 176.20, 180.55 167.14, 189.71 149.03 C 198.88 130.92, 206.84 110.35, 213.58 87.32
    L 213.14 68.84 C 212.70 52.56, 212.48 43.91, 212.48 42.88 C 212.48 34.08, 212.85 27.77, 213.58 23.96
    C 213.88 22.49, 214.21 21.47, 214.57 20.88 C 214.94 20.29, 215.71 20.00, 216.88 20.00
    C 218.35 20.00, 219.82 20.48, 221.28 21.43 C 222.75 22.38, 223.48 23.67, 223.48 25.28 Z`,
    `M 384.36 190.72 C 381.72 190.72, 380.40 189.40, 380.40 186.76 C 380.40 157.13, 379.45 134.44, 377.54 118.67
    C 375.63 102.90, 372.33 95.02, 367.64 95.02 C 359.72 95.02, 348.13 122.67, 332.88 177.96
    L 332.88 178.18 C 332.88 179.94, 332.29 181.44, 331.12 182.69 C 329.95 183.94, 328.41 184.56, 326.50 184.56
    C 323.86 184.56, 322.54 183.24, 322.54 180.60 C 322.54 174.73, 322.83 165.64, 323.42 153.32
    C 324.01 139.53, 324.30 128.68, 324.30 120.76 C 324.30 109.76, 323.97 101.95, 323.31 97.33
    C 322.65 92.71, 321.22 90.40, 319.02 90.40 C 314.03 90.40, 307.73 99.53, 300.10 117.79
    C 292.47 136.05, 284.48 157.57, 276.12 182.36 L 274.14 188.08 C 273.55 189.55, 272.71 190.79, 271.61 191.82
    C 270.51 192.85, 269.30 193.36, 267.98 193.36 C 266.22 193.36, 265.05 193.21, 264.46 192.92
    C 263.87 192.63, 263.51 191.75, 263.36 190.28 C 262.63 183.09, 262.04 173.49, 261.60 161.46
    C 261.31 158.38, 261.01 153.32, 260.72 146.28 C 259.25 121.49, 257.93 104.74, 256.76 96.01
    C 255.59 87.28, 255.00 82.41, 255.00 81.38 C 255.00 80.21, 255.59 78.81, 256.76 77.20
    C 257.93 75.59, 259.03 74.78, 260.06 74.78 C 262.41 74.78, 264.31 76.47, 265.78 79.84
    C 266.51 81.45, 267.32 87.91, 268.20 99.20 C 269.08 110.49, 269.81 124.50, 270.40 141.22
    L 271.50 174.88 C 279.57 149.95, 287.93 127.32, 296.58 107.01 C 305.23 86.70, 313.15 76.54, 320.34 76.54
    C 325.18 76.54, 328.48 80.06, 330.24 87.10 C 332.00 94.14, 332.88 104.33, 332.88 117.68
    C 332.88 124.72, 332.73 134.84, 332.44 148.04 L 332.22 158.16 C 338.23 137.19, 344.21 119.59, 350.15 105.36
    C 356.09 91.13, 362.07 84.02, 368.08 84.02 C 383.19 84.02, 390.74 117.46, 390.74 184.34
    C 390.74 186.10, 390.15 187.60, 388.98 188.85 C 387.81 190.10, 386.27 190.72, 384.36 190.72 Z
    M 428.91 52.12 C 426.41 52.12, 423.88 51.09, 421.32 49.04 C 418.75 46.99, 417.47 45.30, 417.47 43.98
    C 417.47 42.37, 418.24 40.83, 419.78 39.36 C 421.32 37.89, 422.89 37.16, 424.51 37.16
    C 426.71 37.89, 428.54 39.07, 430.01 40.68 C 431.18 41.85, 432.50 43.39, 433.97 45.30
    C 435.43 47.21, 436.17 48.38, 436.17 48.82 C 436.17 51.02, 433.75 52.12, 428.91 52.12 Z
    M 435.51 191.60 C 433.45 191.45, 431.95 188.15, 431.00 181.70 C 430.04 175.25, 429.05 163.00, 428.03 144.96
    C 427.44 133.08, 426.93 121.46, 426.49 110.09 C 426.05 98.72, 425.75 89.96, 425.61 83.80
    C 425.61 82.19, 425.86 80.98, 426.38 80.17 C 426.89 79.36, 427.88 78.96, 429.35 78.96
    C 432.72 78.96, 434.85 80.35, 435.73 83.14 C 436.61 85.93, 437.05 91.28, 437.05 99.20
    L 436.83 125.16 C 436.83 139.97, 437.27 151.85, 438.15 160.80 C 438.15 161.24, 438.81 165.93, 440.13 174.88
    C 441.15 181.04, 441.67 185.15, 441.67 187.20 C 441.67 188.67, 441.04 189.80, 439.80 190.61
    C 438.55 191.42, 437.12 191.75, 435.51 191.60 Z`,
    `M 539.04 194.46 C 537.57 194.46, 536.33 194.13, 535.30 193.47 C 534.27 192.81, 533.76 191.89, 533.76 190.72
    C 533.76 184.71, 534.20 175.39, 535.08 162.78 C 535.96 149.29, 536.40 138.07, 536.40 129.12
    C 536.40 120.47, 536.14 113.39, 535.63 107.89 C 535.12 102.39, 533.91 99.64, 532.00 99.64
    C 527.01 99.64, 521.55 105.84, 515.61 118.23 C 509.67 130.62, 502.89 146.94, 495.26 167.18
    L 491.96 175.98 C 491.37 177.45, 490.38 178.62, 488.99 179.50 C 487.60 180.38, 486.17 180.82, 484.70 180.82
    C 482.94 180.82, 481.77 180.67, 481.18 180.38 C 480.59 180.09, 480.23 179.21, 480.08 177.74
    L 478.32 159.70 L 475.02 128.02 C 473.99 115.41, 472.75 104.41, 471.28 95.02
    C 470.84 92.82, 470.62 91.13, 470.62 89.96 C 470.62 87.76, 471.57 85.96, 473.48 84.57
    C 475.39 83.18, 477.59 82.48, 480.08 82.48 C 481.55 82.48, 482.61 86.00, 483.27 93.04
    C 483.93 100.08, 484.63 111.45, 485.36 127.14 L 486.24 138.80 C 487.41 153.61, 488.07 163.00, 488.22 166.96
    C 488.66 166.08, 489.06 165.09, 489.43 163.99 C 489.80 162.89, 490.27 161.68, 490.86 160.36
    C 498.78 139.83, 506.22 122.70, 513.19 108.99 C 520.16 95.28, 526.87 88.42, 533.32 88.42
    C 537.87 88.42, 540.98 92.27, 542.67 99.97 C 544.36 107.67, 545.42 117.53, 545.86 129.56
    C 546.30 142.91, 546.52 162.41, 546.52 188.08 C 546.52 189.84, 545.79 191.34, 544.32 192.59
    C 542.85 193.84, 541.09 194.46, 539.04 194.46 Z
    M 614.64 137.04 L 599.90 138.80 C 596.38 139.24, 593.08 139.57, 590.00 139.79 C 586.92 140.01, 583.18 140.12, 578.78 140.12
    C 576.87 140.12, 575.19 139.75, 573.72 139.02 C 572.25 138.29, 571.52 137.04, 571.52 135.28
    C 571.52 133.37, 572.18 132.13, 573.50 131.54 C 574.82 130.95, 577.02 130.66, 580.10 130.66
    C 585.67 130.66, 589.60 130.62, 591.87 130.55 C 594.14 130.48, 596.16 130.22, 597.92 129.78
    C 598.51 129.63, 600.19 129.30, 602.98 128.79 C 605.77 128.28, 610.24 127.58, 616.40 126.70
    C 617.57 126.55, 618.56 125.60, 619.37 123.84 C 620.18 122.08, 621.02 121.20, 621.90 121.20
    C 623.51 121.20, 625.16 122.12, 626.85 123.95 C 628.54 125.78, 629.38 127.65, 629.38 129.56
    C 629.38 132.05, 628.35 133.78, 626.30 134.73 C 624.25 135.68, 620.36 136.45, 614.64 137.04 Z`,
    `M 746.66 178.40 C 746.66 180.16, 745.93 182.18, 744.46 184.45 C 742.99 186.72, 741.53 187.86, 740.06 187.86
    C 737.57 187.86, 735.66 186.32, 734.34 183.24 C 733.02 180.16, 732.36 176.57, 732.36 172.46
    C 732.36 168.94, 732.58 158.38, 733.02 140.78 L 733.24 132.42 C 733.24 129.05, 732.36 126.63, 730.60 125.16
    C 724.00 136.31, 717.84 145.99, 712.12 154.20 C 706.40 162.41, 699.14 170.15, 690.34 177.41
    C 681.54 184.67, 672.30 188.30, 662.62 188.30 C 657.93 188.30, 654.30 186.83, 651.73 183.90
    C 649.16 180.97, 647.88 177.15, 647.88 172.46 C 647.88 166.59, 650.52 158.56, 655.80 148.37
    C 661.08 138.18, 667.83 127.84, 676.04 117.35 C 684.25 106.86, 692.47 98.25, 700.68 91.50
    C 706.11 87.10, 710.43 84.13, 713.66 82.59 C 716.89 81.05, 719.75 80.28, 722.24 80.28
    C 724.59 80.28, 727.01 81.01, 729.50 82.48 C 731.99 83.95, 734.12 86.00, 735.88 88.64
    C 737.64 91.28, 738.52 94.29, 738.52 97.66 C 738.52 102.21, 737.27 106.53, 734.78 110.64
    L 738.52 109.54 C 740.13 109.54, 741.09 111.52, 741.38 115.48 C 741.53 117.83, 741.71 122.59, 741.93 129.78
    C 742.15 136.97, 742.33 142.91, 742.48 147.60 C 742.63 152.44, 742.77 157.13, 742.92 161.68
    C 743.07 166.23, 743.21 169.82, 743.36 172.46 C 743.51 173.49, 744.09 174.55, 745.12 175.65
    C 746.15 176.75, 746.66 177.67, 746.66 178.40 Z
    M 727.52 116.58 C 729.28 112.18, 730.16 107.41, 730.16 102.28 C 730.16 99.20, 729.24 96.52, 727.41 94.25
    C 725.58 91.98, 723.12 90.84, 720.04 90.84 C 716.37 90.84, 711.68 93.33, 705.96 98.32
    C 699.36 103.89, 692.39 111.34, 685.06 120.65 C 677.73 129.96, 671.64 139.17, 666.80 148.26
    C 661.96 157.35, 659.54 164.54, 659.54 169.82 C 659.54 174.22, 661.59 176.42, 665.70 176.42
    C 673.62 176.42, 681.25 173.49, 688.58 167.62 C 695.91 161.75, 702.48 154.75, 708.27 146.61
    C 714.06 138.47, 720.48 128.46, 727.52 116.58 Z
    M 779.42 52.12 C 776.93 52.12, 774.40 51.09, 771.83 49.04 C 769.27 46.99, 767.98 45.30, 767.98 43.98
    C 767.98 42.37, 768.75 40.83, 770.29 39.36 C 771.83 37.89, 773.41 37.16, 775.02 37.16
    C 777.22 37.89, 779.06 39.07, 780.52 40.68 C 781.70 41.85, 783.02 43.39, 784.48 45.30
    C 785.95 47.21, 786.68 48.38, 786.68 48.82 C 786.68 51.02, 784.26 52.12, 779.42 52.12 Z
    M 786.02 191.60 C 783.97 191.45, 782.47 188.15, 781.51 181.70 C 780.56 175.25, 779.57 163.00, 778.54 144.96
    C 777.96 133.08, 777.44 121.46, 777.00 110.09 C 776.56 98.72, 776.27 89.96, 776.12 83.80
    C 776.12 82.19, 776.38 80.98, 776.89 80.17 C 777.41 79.36, 778.40 78.96, 779.86 78.96
    C 783.24 78.96, 785.36 80.35, 786.24 83.14 C 787.12 85.93, 787.56 91.28, 787.56 99.20
    L 787.34 125.16 C 787.34 139.97, 787.78 151.85, 788.66 160.80 C 788.66 161.24, 789.32 165.93, 790.64 174.88
    C 791.67 181.04, 792.18 185.15, 792.18 187.20 C 792.18 188.67, 791.56 189.80, 790.31 190.61
    C 789.07 191.42, 787.64 191.75, 786.02 191.60 Z`,
    `M 889.56 100.96 C 888.53 100.96, 887.54 100.52, 886.59 99.64 C 885.63 98.76, 884.57 97.51, 883.40 95.90
    C 882.37 94.43, 881.01 93.19, 879.33 92.16 C 877.64 91.13, 875.92 90.62, 874.16 90.62
    C 869.90 90.62, 864.18 96.23, 857.00 107.45 C 849.81 118.67, 842.77 132.79, 835.88 149.80
    C 836.02 153.17, 836.28 157.43, 836.65 162.56 C 837.01 167.69, 837.27 171.51, 837.42 174.00
    L 838.08 182.80 C 838.08 184.85, 837.64 186.65, 836.76 188.19 C 835.88 189.73, 834.26 190.50, 831.92 190.50
    C 829.42 190.50, 827.81 187.16, 827.08 180.49 C 826.34 173.82, 825.90 164.10, 825.76 151.34
    C 825.61 148.11, 825.50 143.49, 825.43 137.48 C 825.35 131.47, 825.17 124.28, 824.88 115.92
    C 824.44 103.31, 824.22 94.29, 824.22 88.86 C 824.22 85.49, 826.27 83.80, 830.38 83.80
    C 832.87 83.80, 834.37 84.86, 834.89 86.99 C 835.40 89.12, 835.66 93.19, 835.66 99.20
    L 835.66 134.18 C 840.06 122.89, 844.82 113.13, 849.96 104.92 C 855.09 96.71, 860.11 90.44, 865.03 86.11
    C 869.94 81.78, 874.30 79.62, 878.12 79.62 C 881.34 79.62, 884.42 80.35, 887.36 81.82
    C 890.29 83.29, 892.64 85.16, 894.40 87.43 C 896.16 89.70, 897.04 91.87, 897.04 93.92
    C 897.04 95.24, 896.12 96.74, 894.29 98.43 C 892.45 100.12, 890.88 100.96, 889.56 100.96 Z`,
].join(' ')

const SIGNATURE_STROKE_PATH = [
    `M 40 185 C 58 150, 86 136, 102 154 C 118 172, 114 209, 92 208 C 74 207, 63 185, 72 166
    C 83 145, 112 147, 130 167 C 147 186, 160 186, 176 164 C 191 144, 199 95, 204 60
    C 210 18, 243 19, 248 55 C 253 95, 232 129, 214 121 C 198 113, 193 87, 202 60
    C 212 29, 242 31, 248 64 C 253 95, 250 146, 250 193 C 249 221, 262 218, 276 187
    C 287 160, 297 124, 311 124 C 326 125, 329 154, 328 185 C 327 214, 341 216, 351 187
    C 360 161, 369 125, 384 125 C 400 126, 403 156, 401 185 C 399 214, 414 216, 425 188`,
    `C 435 164, 444 136, 457 137 C 470 138, 472 162, 470 185 C 468 212, 481 213, 494 186
    C 505 162, 514 126, 528 126 C 544 127, 546 159, 543 189 C 540 219, 553 218, 567 189
    C 586 149, 604 146, 626 150 C 676 159, 724 159, 770 154 C 814 149, 851 149, 880 158
    C 866 165, 853 179, 853 195 C 853 218, 870 229, 887 219 C 902 210, 909 189, 907 168
    C 905 145, 887 137, 872 144 C 858 151, 852 170, 860 186 C 871 207, 899 209, 919 188`,
    `C 931 168, 940 142, 952 143 C 964 144, 966 166, 965 189 C 964 213, 976 214, 989 191
    C 999 170, 1007 134, 1020 134 C 1036 134, 1040 159, 1035 177 C 1031 192, 1043 197, 1055 190
    C 1074 180, 1084 160, 1096 147 C 1113 129, 1129 131, 1147 148 C 1166 166, 1180 181, 1200 168`,
].join(' ')

const brandStageRef = useTemplateRef<HTMLElement>('brandStageRef')
const brandHaloRef = useTemplateRef<HTMLElement>('brandHaloRef')
const sceneSheenRef = useTemplateRef<HTMLElement>('sceneSheenRef')
const brandWordmarkRef = useTemplateRef<SVGPathElement>('brandWordmarkRef')
const brandPathRef = useTemplateRef<SVGPathElement>('brandPathRef')
const brandGlowRef = useTemplateRef<SVGPathElement>('brandGlowRef')
const brandHighlightRef = useTemplateRef<SVGPathElement>('brandHighlightRef')

let brandTimeline: gsap.core.Timeline | null = null
let lastAnimationRequestAt = 0

const setTraceDash = (path: SVGPathElement, totalLength: number, dashLength: number) => {
    path.style.strokeDasharray = `${dashLength} ${totalLength}`
    path.style.strokeDashoffset = `${totalLength}`
}

const playBrandAnimation = () => {
    const stage = brandStageRef.value
    const halo = brandHaloRef.value
    const sheen = sceneSheenRef.value
    const wordmark = brandWordmarkRef.value
    const mainPath = brandPathRef.value
    const glowPath = brandGlowRef.value
    const highlightPath = brandHighlightRef.value

    if (!stage || !halo || !sheen || !wordmark || !mainPath || !glowPath || !highlightPath) return

    const totalLength = mainPath.getTotalLength()
    const highlightLength = totalLength * 0.18

    brandTimeline?.kill()

    setTraceDash(mainPath, totalLength, totalLength)
    setTraceDash(glowPath, totalLength, totalLength)
    setTraceDash(highlightPath, totalLength, highlightLength)

    gsap.set(stage, {
        opacity: 1,
        scale: 0.94,
        rotate: -1.4,
        filter: 'blur(10px) drop-shadow(0 0 0 rgba(0, 0, 0, 0))',
        transformOrigin: '50% 50%',
    })
    gsap.set(halo, {
        opacity: 0.18,
        scale: 0.82,
        filter: 'blur(18px)',
        transformOrigin: '50% 50%',
    })
    gsap.set(sheen, {
        opacity: 0,
        xPercent: -135,
    })
    gsap.set(wordmark, {
        opacity: 0,
        filter: 'blur(18px)',
        transformOrigin: '50% 50%',
    })
    gsap.set(mainPath, { opacity: 0.96 })
    gsap.set(glowPath, { opacity: 0 })
    gsap.set(highlightPath, { opacity: 0 })

    brandTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } })

    brandTimeline
        .to(
            stage,
            {
                scale: 1,
                rotate: 0,
                filter: 'blur(0px) drop-shadow(0 0 34px rgba(111, 231, 255, 0.18))',
                duration: 0.72,
                ease: 'power3.out',
            },
            0
        )
        .to(mainPath, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0)
        .to(glowPath, { strokeDashoffset: 0, opacity: 0.84, duration: 1.8, ease: 'power2.inOut' }, 0)
        .to(
            wordmark,
            {
                opacity: 0.98,
                filter: 'blur(0px)',
                duration: 0.9,
            },
            0.82
        )
        .to(
            halo,
            {
                scale: 1.08,
                opacity: 0.42,
                duration: 0.76,
                ease: 'sine.out',
            },
            0.55
        )
        .to(sheen, { opacity: 0.92, duration: 0.12, ease: 'power1.out' }, 1.1)
        .to(sheen, { xPercent: 138, duration: 0.9, ease: 'power2.inOut' }, 1.1)
        .to(sheen, { opacity: 0, duration: 0.2, ease: 'power1.out' }, 1.82)
        .to(highlightPath, { strokeDashoffset: 0, opacity: 0.98, duration: 0.9, ease: 'power1.inOut' }, 1.1)
        .to(highlightPath, { opacity: 0, duration: 0.24, ease: 'power1.out' }, 1.94)
        .to(mainPath, { opacity: 0.34, duration: 0.55, ease: 'sine.out' }, 1.82)
        .to(glowPath, { opacity: 0.28, duration: 0.55, ease: 'sine.out' }, 1.82)
        .to(
            halo,
            {
                scale: 1,
                opacity: 0.28,
                duration: 0.6,
                ease: 'sine.out',
            },
            1.82
        )
}

const scheduleBrandAnimation = () => {
    const now = Date.now()

    if (now - lastAnimationRequestAt < 160) return

    lastAnimationRequestAt = now

    void nextTick(() => {
        playBrandAnimation()
    })
}

onMounted(() => {
    scheduleBrandAnimation()
})

onActivated(() => {
    scheduleBrandAnimation()
})

onUnmounted(() => {
    brandTimeline?.kill()
    brandTimeline = null
})
</script>

<template>
    <div class="default-main dashboard-hero-page">
        <section class="brand-scene">
            <div class="scene-grid"></div>
            <div class="scene-noise"></div>
            <div class="scene-orb scene-orb-left"></div>
            <div class="scene-orb scene-orb-right"></div>
            <div class="scene-ring scene-ring-a"></div>
            <div class="scene-ring scene-ring-b"></div>
            <div ref="sceneSheenRef" class="scene-sheen"></div>
            <div ref="brandHaloRef" class="brand-halo"></div>

            <div ref="brandStageRef" class="brand-stage">
                <svg class="brand-signature" viewBox="0 0 918 215" role="img" aria-label="admin-air">
                    <defs>
                        <linearGradient id="brandWordmarkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#eefcff" />
                            <stop offset="38%" stop-color="#bcecff" />
                            <stop offset="72%" stop-color="#fbffff" />
                            <stop offset="100%" stop-color="#d8f5ff" />
                        </linearGradient>
                        <linearGradient id="brandTraceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#4ae2ff" />
                            <stop offset="45%" stop-color="#91f4ff" />
                            <stop offset="100%" stop-color="#e8ffff" />
                        </linearGradient>
                        <linearGradient id="brandHighlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="rgba(255, 255, 255, 0)" />
                            <stop offset="48%" stop-color="rgba(255, 255, 255, 1)" />
                            <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
                        </linearGradient>
                    </defs>

                    <path ref="brandWordmarkRef" class="brand-wordmark" :d="SIGNATURE_OUTLINE_PATH" />
                    <g class="brand-trace-layer" transform="matrix(0.7561 0 0 0.8971 -10.25 -5.33)">
                        <path ref="brandGlowRef" class="brand-trace brand-trace-glow" :d="SIGNATURE_STROKE_PATH" />
                        <path ref="brandPathRef" class="brand-trace brand-trace-main" :d="SIGNATURE_STROKE_PATH" />
                        <path ref="brandHighlightRef" class="brand-trace brand-trace-highlight" :d="SIGNATURE_STROKE_PATH" />
                    </g>
                </svg>
            </div>
        </section>
    </div>
</template>

<style scoped lang="scss">
.dashboard-hero-page {
    margin-bottom: 0;
}

.brand-scene {
    position: relative;
    min-height: calc(100vh - 120px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: clamp(28px, 5vw, 64px);
    border-radius: 36px;
    isolation: isolate;
    background:
        radial-gradient(circle at 18% 18%, rgba(40, 159, 210, 0.28), transparent 24%),
        radial-gradient(circle at 84% 24%, rgba(139, 233, 255, 0.17), transparent 24%),
        radial-gradient(circle at 50% 65%, rgba(13, 72, 129, 0.36), transparent 36%), linear-gradient(135deg, #050b15 0%, #08172c 42%, #071020 100%);
    border: 1px solid rgba(126, 237, 255, 0.14);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.05),
        0 36px 120px rgba(0, 6, 18, 0.6);
}

.scene-grid,
.scene-noise,
.scene-orb,
.scene-ring,
.scene-sheen,
.brand-halo {
    position: absolute;
    pointer-events: none;
}

.scene-grid {
    inset: 0;
    background:
        linear-gradient(rgba(117, 225, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(117, 225, 255, 0.06) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.85) 20%, rgba(0, 0, 0, 0.9) 80%, transparent 100%);
    opacity: 0.45;
}

.scene-noise {
    inset: -20%;
    opacity: 0.18;
    mix-blend-mode: soft-light;
    background-image:
        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 0 1px, transparent 1.6px),
        radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.24) 0 1px, transparent 1.4px),
        radial-gradient(circle at 35% 72%, rgba(255, 255, 255, 0.2) 0 1px, transparent 1.3px),
        radial-gradient(circle at 82% 74%, rgba(255, 255, 255, 0.22) 0 1px, transparent 1.4px);
    background-size: 26px 26px;
    animation: noise-drift 16s linear infinite;
}

.scene-orb {
    border-radius: 50%;
    filter: blur(18px);
    animation: orb-float 10s ease-in-out infinite;
}

.scene-orb-left {
    top: 10%;
    left: 10%;
    width: clamp(180px, 24vw, 340px);
    aspect-ratio: 1;
    background: radial-gradient(circle, rgba(69, 187, 255, 0.4) 0%, rgba(69, 187, 255, 0.08) 50%, transparent 72%);
}

.scene-orb-right {
    right: 7%;
    bottom: 8%;
    width: clamp(220px, 28vw, 400px);
    aspect-ratio: 1;
    background: radial-gradient(circle, rgba(126, 237, 255, 0.24) 0%, rgba(126, 237, 255, 0.06) 52%, transparent 72%);
    animation-delay: -4s;
}

.scene-ring {
    border-radius: 50%;
    border: 1px solid rgba(126, 237, 255, 0.14);
    animation: ring-float 12s ease-in-out infinite;
}

.scene-ring-a {
    top: 18%;
    right: 22%;
    width: clamp(150px, 19vw, 280px);
    aspect-ratio: 1;
}

.scene-ring-b {
    bottom: 16%;
    left: 14%;
    width: clamp(120px, 16vw, 240px);
    aspect-ratio: 1;
    animation-delay: -6s;
}

.scene-sheen {
    top: -12%;
    left: -10%;
    width: 24%;
    height: 130%;
    opacity: 0;
    filter: blur(12px);
    transform: skewX(-16deg);
    background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(189, 245, 255, 0.1) 24%,
        rgba(255, 255, 255, 0.72) 52%,
        rgba(189, 245, 255, 0.14) 76%,
        rgba(255, 255, 255, 0) 100%
    );
    mix-blend-mode: screen;
}

.brand-halo {
    width: min(82vw, 980px);
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(109, 230, 255, 0.28) 0%, rgba(109, 230, 255, 0.1) 32%, transparent 70%);
    filter: blur(26px);
    opacity: 0.28;
    z-index: 0;
}

.brand-stage {
    position: relative;
    z-index: 2;
    width: min(100%, 920px);
}

.brand-signature {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
}

.brand-wordmark {
    fill: url(#brandWordmarkGradient);
    opacity: 0.98;
}

.brand-trace {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
}

.brand-trace-main {
    stroke: url(#brandTraceGradient);
    stroke-width: 8;
}

.brand-trace-glow {
    stroke: url(#brandTraceGradient);
    stroke-width: 18;
    opacity: 0.56;
    filter: blur(8px);
}

.brand-trace-highlight {
    stroke: url(#brandHighlightGradient);
    stroke-width: 14;
    opacity: 0;
    filter: blur(1px);
    mix-blend-mode: screen;
}

html.dark {
    .brand-scene {
        border-color: rgba(126, 237, 255, 0.16);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            0 42px 130px rgba(0, 0, 0, 0.7);
    }
}

@media screen and (max-width: 900px) {
    .brand-scene {
        min-height: calc(100vh - 104px);
        padding: clamp(24px, 6vw, 42px);
        border-radius: 28px;
    }

    .brand-stage {
        width: min(100%, 760px);
    }

    .scene-sheen {
        width: 34%;
    }
}

@media screen and (max-width: 600px) {
    .brand-scene {
        min-height: calc(100vh - 88px);
        padding: 20px;
        border-radius: 22px;
    }

    .scene-grid {
        background-size: 34px 34px;
    }

    .scene-orb-left {
        top: 4%;
        left: -10%;
    }

    .scene-orb-right {
        right: -14%;
        bottom: 4%;
    }

    .scene-ring-a {
        right: 8%;
    }

    .scene-ring-b {
        left: 2%;
    }

    .scene-sheen {
        width: 42%;
    }
}

@keyframes noise-drift {
    0% {
        transform: translate3d(0, 0, 0);
    }
    50% {
        transform: translate3d(-12px, 10px, 0);
    }
    100% {
        transform: translate3d(0, 0, 0);
    }
}

@keyframes orb-float {
    0%,
    100% {
        transform: translate3d(0, 0, 0) scale(1);
    }
    50% {
        transform: translate3d(0, -12px, 0) scale(1.04);
    }
}

@keyframes ring-float {
    0%,
    100% {
        transform: translate3d(0, 0, 0) rotate(0deg);
    }
    50% {
        transform: translate3d(8px, -10px, 0) rotate(8deg);
    }
}
</style>
